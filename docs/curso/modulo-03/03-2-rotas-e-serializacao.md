---
tipo: aula
modulo: 3
aula: "3.2"
status: em-andamento
conceitos:
  - roteamento
  - url
  - parametro-de-rota
  - serializacao
  - toJSON
  - entidade-vs-value-object
tags:
  - curso/aula
  - curso/modulo-03
---

# Aula 3.2 — Rotas e serialização: o domínio atravessando a rede

**Status:** em andamento — tarefa passada.

## Contexto

O servidor da [aula 3.1](03-1-primeiro-servidor.md) responde uma rota que não sabe nada do
casamento. Esta aula liga as duas metades do sandbox: `modulo-03/` passa a importar `Money` e
`Contrato` de `modulo-01/` e a responder sobre contratos de verdade.

Dois problemas já existem e ainda não apareceram. Os dois foram conferidos antes desta aula ser
escrita.

**Primeiro:** o servidor de hoje compara `req.url === "/saude"`. Um monitor que chama
`/saude?origem=monitor` recebe:

```
404
```

**Segundo:** o domínio, do jeito que está, não atravessa a rede.

```
JSON.stringify(Money.deCentavos(390000))   →  {}
JSON.stringify(contratoGauss)              →  {}
JSON.stringify(contratoGauss.gerarParcelas()[0])  →  {"numero":1,"valor":{}}
```

Um contrato inteiro vira um objeto vazio, e uma parcela vira um número sem valor.

## Teoria

### `req.url` não é um caminho

`req.url` é tudo que vem depois do domínio: caminho **e** query string, juntos, como texto.
`/saude?origem=monitor` não é igual a `/saude`, e comparar strings inteiras quebra na primeira
query string que alguém mandar.

A plataforma já tem o parser certo, `URL`:

```ts
// exemplo em outro domínio, de propósito
const url = new URL(req.url ?? "/", "http://localhost");
url.pathname                    // "/livros/978-85-359"
url.searchParams.get("formato") // "epub"
```

O segundo argumento é uma base qualquer: `req.url` chega relativo, e `URL` precisa de um
endereço completo para montar. O `?? "/"` existe porque o tipo de `req.url` é
`string | undefined` — o `strict` cobrando, como na aula 2.3.

### Parâmetro de rota

`/livros/978-85-359` é a rota `/livros/:isbn` com `isbn = "978-85-359"`. Sem framework, isso é
divisão de string: quebrar o `pathname` em `/` e olhar os pedaços. Note o que sobra de cada
divisão — `"/livros/978".split("/")` começa com uma string vazia — e o que o
`noUncheckedIndexedAccess` vai dizer sobre o pedaço que você pegar por índice.

O framework do módulo 5 faz isso com `@Get(":id")`. Aqui você vê o que essa anotação esconde.

### Por que `JSON.stringify(money)` dá `{}`

`JSON.stringify` serializa as propriedades **próprias e enumeráveis** de um objeto. Campos `#`
não são propriedades: não aparecem em `Object.keys`, não aparecem em `for...in`, não aparecem no
JSON. Métodos moram no protótipo, também não aparecem.

Ou seja: o `{}` não é um bug. É o `#centavos` da aula 2.6 fazendo exatamente o que foi pedido a
ele — ninguém de fora enxerga o valor. Nem o `JSON.stringify`.

### Serializar é uma decisão, não um acidente

Quando um objeto tem um método chamado `toJSON`, o `JSON.stringify` chama esse método e
serializa o que ele devolver:

```ts
// exemplo em outro domínio, de propósito
class Temperatura {
  #kelvin: number;
  // …
  toJSON() {
    return { kelvin: this.#kelvin };
  }
}

JSON.stringify(temperatura)  // {"kelvin":300}
```

Antes de escrever o seu, três decisões que são suas — e que valem mais que o código:

**1. Como dinheiro aparece num JSON.** As opções óbvias são `3900` (reais, número), `"R$ 3.900,00"`
(texto formatado) e `390000` (centavos, inteiro). Pense em quem recebe: uma tela em outro país,
um relatório que soma valores, um cliente em JavaScript que vai fazer conta. Só uma das três
sobrevive a todos esses usos — e a resposta já está escrita no
[README do projeto](../../../README.md).

**2. Onde mora a tradução.** `toJSON` dentro de `Money` é uma opção; uma função no `modulo-03`
que lê o domínio e monta o objeto de resposta é outra. Lembre da decisão da aula 2.6: o
`exibirRelatorio` saiu de `Contrato` porque **apresentação não é domínio**. JSON de uma API é
apresentação para outro programa. Mas a função de fora precisa *ler* o valor de `Money` — e hoje
não existe porta de saída nenhuma.

**3. A porta de saída.** Na aula 2.6 ficou registrado: um `valor()` genérico reabre a porta que
a classe fechou, mas existe **um** motivo legítimo para uma saída — a fronteira do sistema
(banco de dados, rede). A diferença entre uma porta legítima e um vazamento está no **nome**:
um método que diz para quê serve é uma fronteira; um que só devolve o número é um convite.

### Entidade × value object

Para existir `/contratos/:id`, um contrato precisa de um `id`. E `Money` não tem, nem deve ter.

Isso não é detalhe de API, é a distinção que a aula 2.6 apresentou: `Money` é um **value
object** — duas notas de R$ 50 são intercambiáveis, o que importa é o valor. `Contrato` é uma
**entidade** — o contrato do salão continua sendo o mesmo contrato se o valor for renegociado.
O que define uma entidade é a identidade, e é ela que vira o `:id` da rota.

Onde esse `id` nasce e quem o gera é uma decisão sua. No módulo 4 ele vai virar a chave primária
de uma tabela; por enquanto, uma string fixa basta.

## Tarefa

1. **Experimento antes de código:** num arquivo qualquer, `console.log(JSON.stringify(...))` de
   um `Money` e de um `Contrato`. Veja o `{}` com os próprios olhos.
2. Trocar a comparação de `req.url` por `new URL(...)` e `pathname`. `/saude?origem=monitor`
   tem que responder `200`.
3. Uma lista de contratos **em memória** em `modulo-03/`, com o salão e o fotógrafo do
   `05-contrato.ts`, cada um com um `id`.
4. `GET /contratos` → `200` com a lista: `id`, `nome`, total e quantidade de parcelas.
5. `GET /contratos/:id` → `200` com o contrato **e as suas parcelas** (número e valor de cada).
   Id inexistente → `404` com corpo JSON.
6. Qualquer outro método em `/contratos` ou `/contratos/:id` → `405` com `Allow: GET`.
7. Dinheiro no JSON em **centavos, inteiro**. E escreva, no arquivo da aula, uma frase dizendo
   por que não reais nem texto formatado.

Reaproveite o que existe: `gerarParcelas` já sabe dividir, `responderJson` já sabe responder.
Nenhuma conta de dinheiro dentro do servidor.

## Verificação

```bash
curl.exe -i http://localhost:3000/saude?origem=monitor
curl.exe -i http://localhost:3000/contratos
curl.exe -i http://localhost:3000/contratos/<id-do-salao>
curl.exe -i http://localhost:3000/contratos/nao-existe
curl.exe -i -X DELETE http://localhost:3000/contratos
```

Saída esperada: `200`, `200` com dois contratos, `200` com 27 parcelas cuja soma dá `1750000`,
`404` com JSON, `405` com `Allow: GET`. E `pnpm typecheck` limpo.

Pergunta para responder em voz alta: **por que `JSON.stringify(Money)` devolve `{}`, e por que
isso é uma boa notícia?**

## O que aconteceu

_(a preencher)_
