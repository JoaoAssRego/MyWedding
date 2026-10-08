---
tipo: aula
modulo: 3
aula: "3.3"
status: em-andamento
conceitos:
  - async-await
  - promise
  - fetch
  - porta-0
  - teste-de-integracao
tags:
  - curso/aula
  - curso/modulo-03
---

# Aula 3.3 — `async`: o servidor testado por um programa

**Status:** em andamento — tarefa passada.

## Contexto

Duas regressões seguidas em código que já funcionava: o `Allow: GET` sumiu na
[aula 3.1](03-1-primeiro-servidor.md) e o `/saude` virou `404` na
[aula 3.2](03-2-rotas-e-serializacao.md). Nos dois casos o motivo foi o mesmo: a verificação do
servidor é um punhado de `curl` digitado à mão, uma vez. O que não é conferido de novo pode ter
quebrado sem ninguém ver.

O domínio não tem esse problema — o `04-testes.ts` roda em um segundo e reconfere tudo. Esta aula
dá ao servidor a mesma coisa: um programa que faz as requisições, confere as respostas e diz
`OK` ou `FALHOU`.

E para fazer requisição de dentro de um programa, entra o assunto que faltava no curso: código
**assíncrono**.

## Teoria

### Por que `fetch` não devolve a resposta

Até aqui toda função do curso devolvia o resultado na hora: `money.somar(outro)` calcula e
retorna. Uma requisição HTTP não pode fazer isso — a resposta está do outro lado de uma rede, e
pode levar 5 milissegundos ou 30 segundos. Se `fetch` parasse o programa esperando, o processo
inteiro ficaria congelado; num servidor, nenhuma outra requisição seria atendida.

Então `fetch` devolve, na hora, uma **promessa** de resposta — um objeto `Promise` — e o programa
continua. Quando a resposta chega, a promessa é cumprida. É o mesmo event loop da 3.1, visto do
outro lado: lá, o servidor esperava eventos; aqui, o seu código espera um.

### `await`

```ts
// exemplo em outro domínio, de propósito
const resposta = await fetch("https://api.exemplo.com/cotacao/USD");
const corpo = await resposta.json();
console.log(corpo.valor);
```

`await` diz: *pause **esta** função até a promessa ser cumprida, e me dê o valor de dentro*.
O resto do processo continua livre — só esta linha espera. Repare que são **dois** `await`: um
para a resposta chegar (status e cabeçalhos), outro para o corpo terminar de chegar e ser lido.

Duas regras práticas:

- `await` só vale dentro de função `async` — ou no nível de cima de um módulo ESM, que é o caso
  do seu sandbox (`"type": "module"`).
- Esquecer o `await` não dá erro de sintaxe. Dá uma `Promise` onde você esperava um valor. O
  TypeScript costuma avisar, mas nem sempre.

### Porta `0`

Um teste que sobe o servidor na 3000 falha se o servidor de desenvolvimento já estiver ligado
nela (`EADDRINUSE`, aula 3.1). `listen(0)` pede ao sistema operacional **qualquer porta livre**.
Depois, `servidor.address()` diz qual foi escolhida.

### O módulo que executa ao ser importado, terceira aparição

Para o teste controlar o servidor — ligar numa porta livre, desligar no fim — ele precisa
**importar** o servidor sem que o servidor se ligue sozinho. Hoje a última linha de
`servidor.ts` é `servidor.listen(3000, …)`: importar o arquivo já liga na 3000.

É o problema da aula 2.2 e da aula 2.6 de novo, com a mesma solução: *módulo exporta; quem
executa é o arquivo de entrada.*

## Tarefa

1. **Experimento:** num arquivo qualquer, com o servidor de desenvolvimento ligado,
   `const r = fetch("http://localhost:3000/saude"); console.log(r);` — **sem** `await`. Depois
   com. Compare o que aparece.
2. Separar o servidor em dois arquivos: um que **cria** o servidor e o exporta, sem ligar; outro,
   o arquivo de entrada, que importa e liga na 3000.
3. `modulo-03/test/servidor.ts`: cria o servidor, `listen(0)`, descobre a porta, faz as
   requisições com `fetch` e confere status, cabeçalhos e corpo. Fecha o servidor no fim — se o
   processo não terminar sozinho, o teste esqueceu de fechar alguma coisa (aula 3.1).
4. Os casos do teste são, no mínimo, **as duas regressões que já aconteceram** e tudo que a
   verificação manual da 3.2 conferia:
   - `GET /saude` e `GET /saude?origem=monitor` → `200`;
   - `POST /saude` → `405` **com** o cabeçalho `Allow: GET`;
   - `GET /contratos` → `200` com dois contratos;
   - `GET /contratos/1` → `200`, e a soma das parcelas é `1750000`;
   - `GET /contratos/01` e `GET /nao-existe` → `404`;
   - `GET /saude/qualquer-coisa` → `404`.

   O último **vai falhar** — é a pendência da 3.2. Escreva o teste primeiro, veja o `FALHOU`, e
   só então corrija o servidor. É a primeira vez no curso que o teste vem antes do conserto.
5. `verificar` já existe em `modulo-01/test/04-testes.ts`. O teste novo vai precisar dele.
   Lembre o padrão que foi registrado no fim do módulo 2.
6. Um script no `package.json` para rodar o teste, e o `pnpm build` continuando sem teste nenhum
   no `dist/`.

## Verificação

```bash
pnpm test:servidor
```

Todos `OK`, exceto a calibração. Depois, a prova de que o teste protege: **estrague** o
servidor de propósito — tire o `Allow` do `405`, por exemplo —, rode de novo e veja o `FALHOU`
aparecer. Desfaça. Um teste que você nunca viu falhar não é um teste (aula 2.4).

`pnpm typecheck` limpo, `pnpm build` sem `test/` no `dist/`.

Pergunta para responder em voz alta: **o que o `console.log(r)` do experimento mostrou sem o
`await`, e por que o programa não esperou a resposta?**

## O que aconteceu

_(a preencher)_
