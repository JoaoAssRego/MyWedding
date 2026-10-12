---
tipo: aula
modulo: 3
aula: "3.3"
status: concluida
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

**Status:** concluída em 11/10/2026, na quarta revisão.

> [!note] Última aula do módulo 3
> Desde a troca do backend para Rails (10/10/2026), esta aula fecha o módulo. Os casos de teste
> escritos aqui viram a lista de testes de integração da API Rails no módulo 5 — vale caprichar.

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

### Revisão 1 — 11/10/2026: não fecha

Entregue até aqui: o experimento do item 1 (`experimento.ts`), o servidor separado em
`server.ts` (cria) e `index.ts` (liga), o teste importando o `server.ts` em vez de carregar uma
cópia do handler (a cópia da primeira versão foi removida) e o script `test:servidor`.
`pnpm typecheck` limpo.

A verificação da aula, rodada como está escrita:

```text
$ pnpm test:servidor
file:///…/sandbox/modulo-03/index.ts:22
servidor.listen(3000, () => console.log("ouvindo na 3000"));
^
ReferenceError: Cannot access 'servidor' before initialization
```

O teste **não chega a fazer nenhuma requisição**. O que bloqueia, por ordem:

1. **Importação circular.** `server.ts` importa `contratos` de `index.ts`, e `index.ts` importa
   `servidor` de `server.ts`. Quando o ponto de entrada é o `index.ts` (`node
   modulo-03/index.ts`), a ordem de avaliação faz funcionar por sorte; quando o ponto de
   entrada é o teste, o `index.ts` roda **antes** de o `servidor` existir e tenta ligá-lo na
   3000. É a terceira aparição do "módulo que executa ao ser importado" — o item 2 separou o
   arquivo, mas os contratos ficaram morando no arquivo que liga a porta.
   *Pergunta:* qual dos dois arquivos deveria ser dono dos contratos — ou nenhum dos dois?
2. **Nada é conferido.** Os `try/catch` só pegam erro de rede: `fetch` **não lança** em `404`
   nem em `405` — uma resposta de erro HTTP ainda é uma resposta. Por isso o caso do `POST`
   imprime `OK` sem olhar nada, e um `404` onde se esperava `200` passaria em silêncio. Os
   itens 4 e 5 pedem status, cabeçalho e corpo conferidos com `verificar`.
   *Pergunta:* onde, na resposta do `fetch`, mora o status — e o cabeçalho `Allow`?
3. **`verificar` não é importável.** Ele mora dentro de `modulo-01/test/04-testes.ts`, que é um
   script. O padrão registrado no módulo 2 é o mesmo do problema 1: módulo exporta, quem
   executa é o arquivo de entrada.
4. **Casos faltando.** `GET /saude/qualquer-coisa` (a pendência da 3.2, que deveria aparecer
   como `FALHOU` antes do conserto) foi trocado por `/qualquer-coisa`, que é outro caso. A soma
   das parcelas do contrato 1 (`1750000`) e a contagem de dois contratos não são conferidas.
5. **Build com teste dentro.** `pnpm build` gerou `dist/modulo-03/test/servidor.js`: o
   `tsconfig.build.json` exclui `modulo-01/test`, não `modulo-03/test`. A regra de
   [convencoes.md](../convencoes.md#verificar-e-construir-são-trabalhos-diferentes) previa uma
   linha só no `exclude` — com testes em duas pastas, ela precisa de um padrão.

Detalhe menor: `${resultado}` dentro de template string imprime `[object Object]`.

Nada disso está commitado ainda — `test/servidor.ts` e `package.json` estão modificados na
árvore de trabalho.

### Revisão 2 — 11/10/2026: não fecha, mas avançou muito

Commits `805f7df`, `7e4d753` e `b706bd0`, mais uma reorganização ainda não commitada (o
`Contrato` saiu de `modulo-01/contrato/` para `sandbox/contrato/`, os dados para
`sandbox/contratos/`, o `verificar` para `sandbox/test/`).

Resolvido desde a revisão 1:

- **Importação circular** — os contratos ganharam um módulo próprio
  (`contratos/contratos.ts`), importado tanto pelo servidor quanto pelos testes. O
  `index.ts` ficou com duas linhas: importa e liga. `pnpm test:servidor` roda até o fim e o
  processo termina sozinho (o `close()` funciona).
- **`verificar` importável** — e foi **movido**, não copiado: o `04-testes.ts` passou a
  importá-lo de `test/verificar.ts`, e os 21 casos do domínio continuam `OK`. O padrão a vigiar
  não voltou.
- **`/saude/qualquer-coisa`** é o caso testado agora, e `test/` do módulo 3 saiu do build.

A verificação, como está hoje:

```text
OK Resultado da saúde do servidor
OK Resultado da saúde do servidor com '?'
FALHOU Esperando Erro, pois /saude não aceita método POST
OK Resultado do endpoint de lista de contratos
OK Resultado do endpoint de contrato 1
FALHOU Resultado do endpoint de contratos/01
FALHOU Resultado do endpoint de rota inexistente
FALHOU Resultado do endpoint de Qualquer Coisa
Não foi possível fazer a requisição
OK Devem existir 2 contratos
```

O que ainda impede de fechar:

1. **Os quatro `FALHOU` são do teste, não do servidor.** `requisicaoGet` e `requisicaoPost`
   conferem `status === 200` para **todo** caso, inclusive os que deveriam dar `404` e `405`.
   O servidor responde certo e o teste reprova; se o servidor quebrasse e devolvesse `200`
   nesses casos, o teste aprovaria. É o inverso de proteger.
   *Pergunta:* o que a função precisa receber, além da URL e da descrição, para saber o que é
   uma resposta certa?
2. **O cabeçalho `Allow: GET` não é conferido** — e é uma das duas regressões que motivaram a
   aula. (O `Allow` enviado **na requisição** do `POST` não faz nada: é o servidor quem o manda
   na resposta.)
3. **O teste do valor nunca roda.** A URL está entre aspas duplas, `"http://localhost:${endereco}/…"`,
   então o `${endereco}` não é substituído e o `fetch` lança. O `catch` engole o erro e imprime
   uma mensagem genérica — o mesmo problema da revisão 1, num lugar novo. E mesmo com a URL
   certa, compara `centavos` (um número) com `getTotal()` (um `Money`): seria `FALHOU` sempre.
   O caso pedido pela tarefa também é outro: a **soma das parcelas** devolvidas pela API
   bater `1750000`.
4. **"Devem existir 2 contratos" confere o array local**, não a resposta do `GET /contratos`.
   Passaria com o servidor desligado.
5. **`test/verificar.ts` está no `dist/`.** Com o `verificar` numa terceira pasta de teste
   (`sandbox/test/`), o `exclude` por caminho fixo ficou para trás de novo. É o que a revisão 1
   chamou de "precisa de um padrão".

Fora da tarefa, mas vale a conversa: `experimento.ts` declara `const rJson: Contrato = await
r.json()` e imprime `rJson.getTotal`. O `json()` devolve um objeto comum, sem métodos — o
`Contrato` só existe do lado do servidor. O TypeScript aceitou porque `json()` devolve `any`,
que desliga a checagem: a mentira de tipo do módulo 2, agora atravessando a rede.
*Pergunta:* o que o `console.log` imprime, e por quê?

Também falta a prova de que o teste protege (estragar o servidor e ver o `FALHOU`), que só faz
sentido depois do ponto 1.

### Revisão 3 — 11/10/2026: falta pouco

Ainda sem commit novo; tudo na árvore de trabalho.

```text
OK Resultado da saúde do servidor
OK Resultado da saúde do servidor com '?'
OK Esperando Erro, pois /saude não aceita método POST
OK Resultado do endpoint de lista de contratos
OK Resultado do endpoint de contrato 1
OK Resultado do endpoint de contratos/01
OK Resultado do endpoint de rota inexistente
OK Resultado do endpoint de Qualquer Coisa
OK Valor total do contrato deve corresponder ao valor exato
OK Devem existir 2 contratos
```

Resolvido desde a revisão 2:

- **Status esperado por caso** — as funções de requisição recebem `statusEsperado`, tipado com o
  `StatusHttp` exportado pelo servidor. Os `404` e o `405` agora são conferidos de verdade.
- **Soma das parcelas** — o teste lê as parcelas da resposta, reconstrói cada valor com
  `Money.deJSON` e soma com `somar`, em vez de comparar número com objeto. O `Money` ganhou
  `MoneyJson` e `deJSON`: o caminho de volta do `toJSON`, passando pela validação do
  `deCentavos`. Boa decisão de domínio — o teste usa o domínio, não reimplementa a soma.
- **Contagem pela API** — "2 contratos" agora vem do `GET /contratos`.
- **Build** — `./test` no `exclude`; o `dist/` saiu sem nenhum arquivo de teste.
- **`experimento.ts`** reescrito com `deJSON`: a mentira de tipo da revisão 2 foi entendida e
  consertada ali.

`pnpm typecheck` limpo; os 21 casos do domínio continuam `OK`.

O que ainda impede de fechar:

1. **O `Allow: GET` continua sem conferência.** É um dos itens explícitos da tarefa e a primeira
   das duas regressões que motivaram a aula. Hoje, apagar o `{ allow: "GET" }` do servidor
   deixaria os dez casos `OK` — a regressão da 3.1 voltaria sem ninguém ver. Para conferir, a
   função precisa devolver a resposta (ou receber o que conferir nela), não só o status.
2. **A prova de que o teste protege** — estragar o servidor de propósito, ver o `FALHOU`,
   desfazer. Começar justamente pelo `Allow`, depois do ponto 1.
3. **A pergunta em voz alta** da aula: o que o `console.log(r)` mostrou sem o `await`, e por
   que o programa não esperou a resposta.

Pequenos, viram pendência se não forem resolvidos agora:

- `listaContratosApi: Contrato[]` repete a mentira de tipo que o `experimento.ts` corrigiu: o
  que vem do `json()` não é um `Contrato`, não tem `getId()` nem `gerarParcelas()`.
- O `catch` do caso do valor imprime "Não foi possível fazer a requisição", sem `FALHOU` e sem
  o erro. Se o `deJSON` lançar porque a API mandou um valor inválido, o teste não reprova — só
  avisa.

### Revisão 4 — 11/10/2026: fecha

O `requisicaoPost` passou a **devolver a resposta**, e o teste confere
`headers.get("allow") === "GET"` no `405`. O `Allow` enviado na requisição saiu.

```text
OK Resultado da saúde do servidor
OK Resultado da saúde do servidor com '?'
OK Esperando Erro, pois /saude não aceita método POST
OK Resposta 405 de /saude deve informar o cabeçalho Allow: GET
OK Resultado do endpoint de lista de contratos
OK Resultado do endpoint de contrato 1
OK Resultado do endpoint de contratos/01
OK Resultado do endpoint de rota inexistente
OK Resultado do endpoint de Qualquer Coisa
OK Valor total do contrato deve corresponder ao valor exato
OK Devem existir 2 contratos
```

`pnpm typecheck` limpo, `pnpm build` sem nenhum arquivo de teste no `dist/`, os 21 casos do
domínio `OK` (só a calibração em `FALHOU`), e o processo do teste termina sozinho.

**A prova de que o teste protege**, feita pelo Claude numa cópia do sandbox fora do
repositório, com três estragos — cada um pego pelo caso certo, e só por ele:

| Estrago no servidor | O que o teste disse |
|---|---|
| tirar o `{ allow: "GET" }` (a regressão da 3.1) | `FALHOU Resposta 405 de /saude deve informar o cabeçalho Allow: GET` |
| `/saude/qualquer-coisa` voltar a responder `200` (a regressão da 3.2) | `FALHOU Resultado do endpoint de Qualquer Coisa` |
| a API perder uma parcela do contrato 1 | `FALHOU Valor total do contrato deve corresponder ao valor exato` |

> [!tip] Vale repetir com as próprias mãos
> O estrago foi feito pelo Claude, não pelo João. Repetir um deles (tirar o `Allow`, rodar,
> ver o `FALHOU`, desfazer) leva um minuto — e é a diferença entre ler que o teste protege e
> ter visto.

**Pergunta em voz alta** — o que o `console.log(r)` mostrou sem o `await`, e por que o
programa não esperou:

> Mostrou `Promise { <pending> }`. O `fetch` não devolve o resultado direto: devolve na hora
> uma `Promise`, a promessa de que o valor chega depois. Sem `await` o JavaScript não espera;
> registra a `Promise` como ela está naquele instante, e naquele instante o pedido ainda não
> terminou — por isso `<pending>`.

Fecha. O complemento: a requisição **terminou** logo depois e a `Promise` foi cumprida — só
que ninguém estava olhando. É o `await` que diz "esta função espera aqui"; sem ele, a linha
seguinte roda e o resultado chega para ninguém.

O que a aula deixou:

- o primeiro teste do curso escrito **antes** do conserto (o `/saude/qualquer-coisa`);
- `Money.deJSON` e `MoneyJson` — o caminho de volta do `toJSON`, validado;
- a reorganização do sandbox: `Contrato` em `contrato/`, os dados de exemplo em `contratos/`,
  `verificar` em `test/`, usados pelos dois testes.

## Pendências

- `listaContratosApi: Contrato[]` — o que vem do `json()` não é um `Contrato`. Mesma mentira
  de tipo que o `experimento.ts` corrigiu.
- O `catch` do caso do valor imprime "Não foi possível fazer a requisição", sem `FALHOU` e sem o
  erro: se o `deJSON` lançar, o teste avisa em vez de reprovar.
- O `exclude` do `tsconfig.build.json` lista três pastas de teste uma a uma; a quarta vai
  entrar no `dist/` sem ninguém ver.
