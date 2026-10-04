---
tipo: aula
modulo: 3
aula: "3.1"
status: em-andamento
conceitos:
  - processo
  - porta
  - http
  - status-code
  - content-type
  - types-node
tags:
  - curso/aula
  - curso/modulo-03
---

# Aula 3.1 — O primeiro servidor: processo, porta, requisição e resposta

**Status:** em andamento — tarefa passada.

## Contexto

Até aqui todo programa do curso nasceu, imprimiu e morreu: `node 05-contrato.ts` roda, escreve
dois relatórios e o processo termina. Um servidor é o primeiro programa que **não termina**. Ele
abre uma porta, fica esperando, e reage cada vez que alguém bate.

## Teoria

### Um servidor é um processo esperando numa porta

Uma porta é só um número (de 0 a 65535) que o sistema operacional usa para saber para qual
processo entregar o que chega pela rede. Quando o seu programa diz "escuto na 3000", ele pede ao
sistema: *tudo que chegar na porta 3000 é meu*. Se outro processo já pediu a 3000, você recebe
`EADDRINUSE` — a porta está ocupada.

E o processo não termina porque o Node só encerra quando não há mais nada pendente. Uma porta
aberta é algo pendente para sempre. Por isso o servidor para com `Ctrl+C`, não sozinho.

### HTTP é texto

Antes de qualquer biblioteca, vale ver que HTTP é um protocolo de **texto**. Uma requisição é
literalmente isto, atravessando a rede:

```
GET /saude HTTP/1.1
Host: localhost:3000
Accept: */*
```

E a resposta:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 15

{"status":"ok"}
```

Primeira linha, cabeçalhos, uma linha em branco, corpo. É tudo. O `curl -i` mostra exatamente
isso, e é a ferramenta principal deste módulo: o navegador esconde o protocolo, o `curl` não.

### As três coisas que toda resposta decide

1. **Status code** — o resultado em um número. Os que importam agora:
   `200` deu certo, `404` não existe, `405` o caminho existe mas não com esse método,
   `500` o servidor quebrou. A família diz de quem é a culpa: `4xx` é de quem pediu, `5xx` é
   de quem respondeu.
2. **`Content-Type`** — o que é o corpo. Sem ele, quem recebe precisa adivinhar se aquilo é
   JSON, HTML ou texto.
3. **O corpo** — e ele é sempre texto (ou bytes). Objeto JavaScript não atravessa a rede;
   `JSON.stringify` atravessa.

### `node:http`: um callback por requisição

```ts
// exemplo em outro domínio, de propósito
import { createServer } from "node:http";

const servidor = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/hora") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(new Date().toISOString());
    return;
  }
  res.statusCode = 404;
  res.end();
});

servidor.listen(4000, () => console.log("ouvindo na 4000"));
```

A função passada a `createServer` roda **uma vez por requisição**. `req` é o que chegou
(método, URL, cabeçalhos); `res` é o que você vai devolver. `res.end()` é o que manda a resposta
de fato — esqueça dele e o cliente fica pendurado esperando até desistir.

### Os tipos do Node não vêm de graça

`sandbox/tsconfig.json` tem `"types": []`, que diz ao compilador: *não carregue nenhum pacote de
tipos automaticamente*. Até agora isso não importou, porque o código só usava a linguagem
(`Math`, `Intl`, `Error`). `node:http` é uma API do **runtime** Node, e os tipos dela moram num
pacote separado, `@types/node`.

Você vai ver o erro primeiro e consertar depois — é a ordem certa.

## Tarefa

1. Criar `sandbox/modulo-03/servidor.ts` com um servidor na porta `3000`.
2. `GET /saude` → `200`, `Content-Type: application/json`, corpo `{"status":"ok"}`.
3. Qualquer outro caminho → `404`, também com corpo JSON explicando o erro.
4. `/saude` com qualquer método que não seja `GET` → `405`.
5. Rodar `pnpm typecheck`, **ler** o erro que aparecer no `import` do `node:http`, e resolver
   instalando o pacote de tipos certo e ajustando o `types` do `tsconfig.json`.
6. O `rootDir` atual é `./modulo-01`. Com uma pasta nova, o compilador vai reclamar. Leia o
   erro, entenda o que o `rootDir` controla (aula 2.7) e ajuste — e confira para onde foram os
   arquivos no `dist/` depois disso.

Não importe nada de `modulo-01/` ainda. Esta aula é só o servidor.

## Verificação

Com o servidor rodando num terminal (`node modulo-03/servidor.ts`), em outro:

```bash
curl -i http://localhost:3000/saude
curl -i http://localhost:3000/nao-existe
curl -i -X POST http://localhost:3000/saude
```

> [!warning] No PowerShell, `curl` não é o curl
> No Windows PowerShell 5.1, `curl` é um apelido para `Invoke-WebRequest`, que tem outra sintaxe
> e outra saída. Use `curl.exe` (o curl de verdade, que vem com o Windows 11) ou rode os
> comandos no Git Bash.

Saída esperada, na primeira linha de cada: `200 OK`, `404 Not Found`, `405 Method Not
Allowed` — e nas três um `Content-Type: application/json` e um corpo JSON válido.

`pnpm typecheck` limpo, e `pnpm build` gerando o servidor no `dist/`.

Pergunta para responder em voz alta: **por que `node servidor.ts` não termina, enquanto
`node 05-contrato.ts` termina?**

## O que aconteceu

_(a preencher)_
