---
tipo: aula
modulo: 3
aula: "3.1"
status: concluida
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

**Status:** concluída em 07/10/2026.

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

### Primeira entrega — 06/10/2026

Configuração resolvida sem tropeço: `@types/node` instalado, `"types": ["node"]`, e
`rootDir` trocado para `./`. Com isso a árvore do `dist/` passou a espelhar as pastas —
`dist/modulo-01/…` e `dist/modulo-03/servidor.js` —, e o script de relatórios mudou de
endereço: agora é `node dist/modulo-01/05-contrato.js`. `pnpm typecheck` e `pnpm build` limpos.

Os três status codes saem certos:

```
GET  /saude       → HTTP/1.1 200 OK               {"status":"ok"}
GET  /nao-existe  → HTTP/1.1 404 Not Found        (corpo vazio)
POST /saude       → HTTP/1.1 405 Method Not Allowed (corpo vazio)
```

Faltam o `Content-Type` nas três respostas e o corpo JSON no `404` e no `405`.

### O `return` que falta, e o servidor que morre

O ramo do `405` chama `res.end()` e **não retorna**: a execução cai para as linhas do `404`
logo abaixo. Hoje isso passa despercebido, porque o segundo `res.end()` vazio é ignorado. Mas
os itens 2 e 3 da tarefa pedem exatamente o que transforma isso em queda: colocando
`setHeader("Content-Type", …)` no `404` e rodando `POST /saude` contra uma cópia assim:

```
HTTP/1.1 405 Method Not Allowed      ← a resposta sai certa…
node:_http_outgoing:684
    throw new ERR_HTTP_HEADERS_SENT('set');
Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
Node.js v24.21.0                     ← …e o processo morre
```

e a requisição seguinte, de qualquer pessoa, já não tem resposta nenhuma.

> [!warning] Num servidor, uma exceção não tratada não derruba uma requisição: derruba todas
> No `05-contrato.ts`, uma exceção encerrava um programa que ia terminar de qualquer jeito. Num
> servidor, ela encerra o processo que estava atendendo todo mundo. Uma única requisição mal
> formada vira indisponibilidade total.

### A pergunta do processo que não termina

Resposta do João: *"o programa reserva a porta 3000 para o servidor. Não sei exatamente como
funciona para virar um servidor, se é uma execução infinita do script até ele ser desligado"*.

A primeira metade está certa — a porta reservada é o motivo. A segunda é uma pergunta honesta,
e a resposta é **não**: o script não fica em laço. Ele roda de cima a baixo e **acaba** —
`servidor.listen(…)` retorna na hora, e a última linha do arquivo é executada em
milissegundos. O que mantém o processo vivo é o **event loop** do Node: depois que o script
termina, o Node olha se ainda existe algo pendente (um *handle*: socket escutando, timer
agendado, arquivo sendo lido). Enquanto existir, ele fica esperando eventos, e cada requisição
que chega é um evento que dispara o callback do `createServer`.

O processo termina quando não há mais nada pendente — ou por fora: `Ctrl+C` (um sinal do sistema
operacional), `servidor.close()`, ou uma exceção que ninguém tratou, como a de cima.

Experimento proposto para ver isso em vez de acreditar:

1. `console.log("fim do script")` **depois** do `listen` — e observar em que ordem as duas
   mensagens aparecem;
2. `setTimeout(() => servidor.close(), 10_000)` — e observar o processo terminar sozinho depois
   de dez segundos, sem `Ctrl+C`.

### Segunda entrega — 06/10/2026: o mesmo erro por outro caminho

Entregues: `return` depois do `405`, `Content-Type: application/json` nas três respostas (agora
com `res.writeHead`), um `Allow: GET` no `405`, e o `console.log("fim do script")` do
experimento.

Rodando com `curl -i`:

```
GET  /saude       → 200 OK                  Content-Type: application/json   {"status":"ok"}
GET  /nao-existe  → 405 Method Not Allowed  ← deveria ser 404
POST /saude       → (sem resposta)
GET  /saude       → (sem resposta — o processo morreu)
```

E o log do servidor:

```
fim do script
ouvindo na 3000
Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    at ServerResponse.setHeader (…)
    at Server.<anonymous> (modulo-03/servidor.ts:11:9)
```

Dois defeitos novos:

1. **`writeHead` fecha os cabeçalhos.** No ramo do `405`, `res.writeHead(405, {…})` vem antes de
   `res.setHeader("Allow", "GET")`. Depois do `writeHead` os cabeçalhos estão decididos, e o
   `setHeader` seguinte estoura — o mesmo `ERR_HTTP_HEADERS_SENT` da primeira entrega, por outro
   caminho. Um `POST /saude` derruba o servidor para todo mundo, de novo.
2. **O `404` responde `405`.** O ramo final faz `res.statusCode = 404` e, na linha seguinte,
   `res.writeHead(405, …)` — que sobrescreve o status. É a linha do `405` copiada para o `404`
   sem ajustar o número. A cópia, outra vez.

Continuam faltando os corpos JSON no `404` e no `405`.

> [!tip] Por que o mesmo erro voltou
> As três respostas repetem a mesma sequência à mão: status, cabeçalhos, corpo, `end`. Cada
> repetição é uma chance de errar a ordem ou copiar o número errado — e as duas aconteceram.
> Uma função `responderJson(res, status, corpo, cabecalhosExtras?)` escreveria essa sequência
> **uma vez**, na ordem certa, e os três ramos só diriam *o que* responder. É o primeiro passo do
> que o NestJS vai fazer por você no módulo 5.

### O experimento: a ordem das mensagens

O log mostra `fim do script` **antes** de `ouvindo na 3000`, apesar de o `console.log` do fim
estar escrito **depois** do `listen` no arquivo. É a prova do que a teoria dizia: o `listen`
não espera a porta abrir; ele pede, retorna na hora, e o script segue até o fim. O callback do
`listen` é ele mesmo um evento, entregue pelo event loop quando a porta de fato abriu — depois
que o script já tinha terminado.

Resposta do João à pergunta: *"o Node utiliza-se do event loop para manter o processo vivo,
esperando uma requisição por meio da conexão socket que foi feita"*. **Fecha** — o socket que
escuta é o algo pendente, e o event loop é quem espera por ele. A precisão que falta é só de
quem depende de quem: o event loop não mantém o processo vivo por si só; ele continua rodando
**porque** existe um socket aberto. Fechado o socket (o `servidor.close()` do item 2 do
experimento, que ainda não foi rodado), o loop esvazia e o processo termina sozinho.

### Terceira entrega — 07/10/2026: o servidor sobrevive

`Allow: GET` foi para dentro do objeto do `writeHead`, e o `404` voltou a ser `404`:

```
GET  /saude       → 200 OK                  Content-Type: application/json   {"status":"ok"}
GET  /nao-existe  → 404 Not Found           Content-Type: application/json   (corpo vazio)
POST /saude       → 405 Method Not Allowed  Content-Type: application/json   Allow: GET   (corpo vazio)
GET  /saude       → 200 OK                  ← o servidor sobreviveu ao POST
```

E o item 2 do experimento rodou: com `setTimeout(() => servidor.close(), 10_000)`, o processo
terminou **sozinho, com código 0, depois de 10 segundos**, sem `Ctrl+C`. Fechado o socket, o
event loop ficou sem nada pendente e o Node encerrou — a teoria da aula, observada.

> [!warning] O cabeçalho promete o que o corpo não entrega
> O `404` e o `405` dizem `Content-Type: application/json` e mandam corpo **vazio**. String
> vazia não é JSON válido: um cliente que confie no cabeçalho e faça `JSON.parse` da resposta
> recebe `SyntaxError: Unexpected end of JSON input`. Um cabeçalho que mente é pior do que
> nenhum cabeçalho, porque o cliente acredita nele.

### Quarta entrega — 07/10/2026: `responderJson`, e o cabeçalho que se perdeu no caminho

O João escreveu o `responderJson` — a parte opcional — e com ele os três ramos viraram três
linhas que dizem só *o que* responder. Os corpos JSON entraram, o `setTimeout` saiu, e o
`typecheck` passa. Conferido com `curl -i` e com `JSON.parse` em cada corpo:

```
GET  /saude       → 200  {"status":"ok"}                                              JSON válido
GET  /nao-existe  → 404  {"erro":"Endpoint não encontrado. Endpoint suportado: /saude"}  JSON válido
POST /saude       → 405  {"erro":"Método não permitido. Métodos suportados: GET"}       JSON válido
GET  /saude       → 200  ← sobreviveu
```

Duas coisas boas além do pedido: `STATUS_CODES`, importado do próprio `node:http`, para não
inventar uma tabela de status; e `type ServerResponse` no mesmo import, com `import type`
inline — o `verbatimModuleSyntax` da aula 2.1 sendo usado sem esforço.

> [!warning] A refatoração apagou o `Allow: GET`
> O `responderJson` só sabe escrever `Content-Type`. Ao mover os três ramos para dentro dele, o
> `Allow: GET` do `405` — conquistado na rodada anterior — sumiu, e nenhum teste percebeu porque
> não existe teste do servidor. A informação foi parar no corpo ("Métodos suportados: GET"), mas
> o corpo é para gente ler; o cabeçalho é para **programas** lerem. Um cliente HTTP ou uma
> ferramenta procura o `Allow`, não interpreta a frase.
>
> É a regressão clássica de refatoração: o código ficou mais bonito e perdeu um comportamento
> no caminho. O remédio é o que já estava proposto na aula 3.1 — um parâmetro
> `cabecalhosExtras` — e, no módulo 10, um teste que trave o `Allow` no lugar.

### Um `throw` dentro do servidor

```ts
if (!STATUS_CODES[statusCode]) {
  throw new Error(`Envie um Status Code válido. Enviado: ${statusCode}`);
}
```

A intenção é boa — recusar um status que não existe. Mas esse `throw` roda **dentro do callback
de uma requisição**, e a primeira entrega desta aula mostrou o que acontece ali: exceção não
tratada derruba o processo inteiro. Um `responderJson(res, 2000, …)` digitado errado numa rota
vira queda total na primeira vez que alguém chamar essa rota.

E esse é um erro que dá para saber **antes de rodar**: o status é um número escrito no código,
não um valor que chega da rede. A aula 2.5 já respondeu onde esse tipo de erro deve ser pego.

### Quinta entrega — 07/10/2026: fecha

`responderJson` ganhou um quarto parâmetro, `headersExtras`, espalhado dentro do objeto do
`writeHead` — o `Allow: GET` voltou, e entra **antes** de os cabeçalhos fecharem por construção,
não por cuidado. E o `throw` em runtime virou um tipo:

```ts
type StatusHttp = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 405 | 409 | 422 | 500 | 503;
```

Uma união de tipos literais — a mesma ferramenta dos tipos literais da aula 2.4, agora usada de
propósito. Verificação:

```
GET  /saude       → 200  Content-Type: application/json               {"status":"ok"}
GET  /nao-existe  → 404  Content-Type: application/json               {"erro":"Endpoint não encontrado…"}
POST /saude       → 405  Content-Type: application/json   allow: GET  {"erro":"Método não permitido…"}
GET  /saude       → 200  ← sobreviveu
```

E o ritual da aula 2.6, numa cópia com `responderJson(res, 2000, …)`:

```
modulo-03/servidor.ts(5,33): error TS2345: Argument of type '2000' is not assignable to parameter of type 'StatusHttp'.
```

O status inválido que antes derrubaria o servidor na primeira requisição agora **não compila**.
Foi a lição do módulo 2 — "o que dá para saber antes de rodar, o compilador pega" — aplicada
sozinha num contexto novo.

## Fechamento

A aula começou com um servidor que caía e terminou com uma função que torna impossível escrever
os dois erros que o derrubaram (cabeçalho depois de fechado, status inexistente). No caminho:
event loop observado em vez de explicado, e a diferença entre cabeçalho (para programas) e corpo
(para pessoas).

## Pendências

- `204` na união `StatusHttp` é uma contradição dentro de um `responderJson`: *204 No Content*
  significa **sem corpo**, e a função sempre manda corpo e `Content-Type: application/json`.
  As outras entradas que ninguém usa ainda (`201`, `401`, `409`…) são vocabulário razoável;
  essa é a única que mente.
- `corpo: unknown` aceita qualquer coisa — inclusive o que `JSON.stringify` não sabe
  serializar. Volta na [aula 3.2](03-2-rotas-e-serializacao.md), com o `Money`.
