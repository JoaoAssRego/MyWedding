---
tipo: aula
modulo: 3
aula: "3.2"
status: concluida
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

**Status:** concluída em 07/10/2026.

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

### Primeira entrega — 07/10/2026

`modulo-03/servidor.ts` passou a importar o domínio, usar `new URL(...)` e quebrar o `pathname`
em partes. `Contrato` ganhou `#id` e virou entidade; `Money` e `Contrato` ganharam `toJSON`.
`pnpm typecheck` limpo; `04-testes.ts` e `05-contrato.ts` continuam iguais.

```
GET    /contratos            → 200  [{"id":1,"nome":"Casarão do Paraiso","total":{"centavos":1750000},"quantidadeParcelas":27}, …]
GET    /contratos/1          → 200  27 parcelas, soma 1750000, 1ª {"numero":1,"valor":{"centavos":64815}}
GET    /contratos/nao-existe → 404  {"erro":"Contrato não encontrado"}
DELETE /contratos            → 405  allow: GET
```

As parcelas vêm de `gerarParcelas` e o valor de cada uma, do `toJSON` de `Money`: nenhuma conta
de dinheiro dentro do servidor, como a tarefa pedia. A serialização aninhada funciona sozinha —
o `toJSON` de `Contrato` devolve um `Money`, e o `JSON.stringify` chama o `toJSON` dele também.

**Decisões do João:**

- Dinheiro como `{"centavos": 1750000}`, um objeto e não um inteiro solto. É a escolha que
  aguenta crescer: o dia em que entrar moeda, vira `{"centavos": …, "moeda": "BRL"}` sem quebrar
  quem já lê `centavos`.
- `toJSON` **dentro do domínio**, não numa função do `modulo-03`. É defensável: `toJSON` não faz
  I/O nem conhece HTTP, é uma convenção da linguagem para "como este objeto vira texto". O custo é
  que o formato da API passa a ser decidido pelo domínio — uma versão 2 da API com outro formato
  obrigaria a mexer em `Money`. Fica registrado como decisão, à espera da justificativa escrita
  pelo João.
- `Contrato` com `#id`, `Money` sem: a distinção entidade × value object aplicada certo.

### `/saude` quebrou

```
GET /saude?origem=monitor → 404
GET /saude                → 404   ← funcionava antes desta aula
```

A comparação virou `partes[1] === "/saude"`, mas o `split("/")` **remove** as barras: o
`partes[1]` de `/saude` é `"saude"`. A rota que existia antes da aula sumiu, e o item 2 da tarefa
— justamente a query string em `/saude` — não passa.

É a segunda regressão seguida em código que funcionava (a outra foi o `Allow: GET` na 3.1), e
pelo mesmo motivo: nenhum teste olha para o servidor. A verificação é feita à mão, com `curl`,
uma vez — e o que não foi conferido de novo pode ter quebrado.

### Um contrato, cinco endereços

```
/contratos/1    → contrato 1
/contratos/01   → contrato 1
/contratos/1.0  → contrato 1
/contratos/0x1  → contrato 1
/contratos/1e0  → contrato 1
```

`Number(...)` é generoso: aceita zeros à esquerda, decimal, hexadecimal e notação científica. O
mesmo recurso fica acessível por URLs diferentes, o que confunde cache, logs e qualquer cliente
que compare endereços. É a primeira **validação de entrada** do curso: o que vem da URL é texto
escrito por outra pessoa, e o servidor decide o que aceita como id.

### Segunda entrega — 07/10/2026: o código passa

```
GET    /saude                 → 200        GET /contratos/01          → 404
GET    /saude?origem=monitor  → 200        GET /contratos/1.0         → 404
POST   /saude                 → 405        GET /contratos/0x1         → 404
GET    /contratos             → 200        GET /contratos/1e0         → 404
GET    /contratos/1           → 200 (27 parcelas, soma 1750000)
DELETE /contratos             → 405        GET /contratos/nao-existe  → 404
```

`/saude` voltou (`partes[1] === "saude"`, sem a barra). E as quatro formas alternativas do id
caíram — não por uma validação, mas por uma **mudança de representação**: o `id` passou de
`number` para `string`, e a comparação virou igualdade exata de texto. `"01"` não é `"1"`, e
pronto.

É a solução mais elegante que havia. Um id não é um número: ninguém soma, divide ou compara
ids por tamanho. É um **identificador opaco** que por acaso foi escrito com dígitos. Tratá-lo
como texto tira do `Number(...)` a chance de interpretar o que não devia — e é como ele vai
chegar no módulo 4, quando virar chave primária (provavelmente um UUID, que nem dígito é).

### As justificativas

**Item 7 — por que centavos.** Resposta do João: *"texto formatado é apresentação visual, não
dado; obriga o cliente a usar regex para extrair números e quebra em clientes internacionais"*.
Certo, e com o argumento do cliente internacional, que é o mais forte. Mas a pergunta tinha
**duas** alternativas recusadas, e a de reais (`3900` como número) ficou sem resposta.

**Justificativa do `toJSON` no domínio.** *"É uma convenção nativa da linguagem, sem conhecer
HTTP, rede ou I/O. Mantê-lo no domínio viabiliza a serialização aninhada automática sem exigir
que camadas externas violem o encapsulamento ou acessem campos privados."* **Fecha** — e traz
um argumento melhor do que o que estava na aula: a alternativa (função no `modulo-03`) obrigaria
`Money` a abrir uma porta de saída **genérica** para que alguém de fora lesse os centavos. Com
`toJSON`, a única saída é a serialização.

**A pergunta da aula.** *"`JSON.stringify` só serializa propriedades públicas e enumeráveis; o
valor mora em `#centavos`, invisível para `Object.keys`, `for...in` e o próprio
`JSON.stringify`."* A primeira metade — **por que** devolve `{}` — está completa. A segunda — **por
que isso é uma boa notícia** — ficou sem resposta.

### Terceira entrega — 07/10/2026: fecha

**Item 7, a metade que faltava — por que não reais.** *"Em JavaScript todo número é ponto
flutuante IEEE 754. No momento em que o cliente fizer soma, divisão ou cálculo de parcelas, a
imprecisão entra em ação (`0.1 + 0.2 = 0.30000000000000004`) e o total passa a divergir do
extrato bancário. Com centavos inteiros a aritmética é sempre exata: o centavo é a menor unidade
indivisível."* Fecha — e é a mesma frase de abertura do README do projeto, agora com as
palavras dele.

**Por que o `{}` é uma boa notícia.** *"Se o `JSON.stringify` lesse o `#centavos` sozinho:
vazamento da implementação interna, acoplamento acidental — detalhes internos virariam o
contrato público da API —, e impossibilidade de refatorar: renomear o campo ou mudar para
`BigInt` quebraria todos os clientes."* Fecha, com o argumento que importa: **campo interno e
contrato público são coisas diferentes**.

E vale notar a ironia que prova o ponto: o `toJSON` de hoje devolve exatamente
`{"centavos": …}` — o mesmo nome do campo privado. A diferença é que agora a coincidência é uma
**decisão**. Se amanhã o `#centavos` virar `#valorEmCentavos`, o `toJSON` continua devolvendo
`centavos`, e nenhum cliente percebe.

## Fechamento

Verificação final (segunda entrega, sem mudança de código depois): `/saude` com e sem query
string, `/contratos`, `/contratos/1` com 27 parcelas somando `1750000`, as quatro formas
alternativas do id em `404`, `405` com `Allow`, `typecheck` limpo.

A aula ligou as duas metades do sandbox: o domínio do módulo 2 atravessando a rede sem perder um
centavo e sem abrir uma porta de saída genérica.

## Pendências

- `GET /saude/qualquer-coisa` responde `200` — vira caso de teste na
  [aula 3.3](03-3-async-e-teste-do-servidor.md).
- Duas regressões seguidas (`Allow` na 3.1, `/saude` na 3.2) sem nenhum teste que as pegasse —
  é o motivo da aula 3.3.
- `getId()` segue o estilo dos outros getters — herdado da [aula 2.6](../modulo-02/02-6-money-value-object.md).
