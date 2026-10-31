---
tipo: aula
modulo: 5
aula: "5.1"
status: em-andamento
conceitos:
  - rack
  - env
  - config-ru
  - puma
  - json
  - porta-publicada
  - rack-mockrequest
tags:
  - curso/aula
  - curso/modulo-05
---

# Aula 5.1 — Rack: a API do módulo 3 sem framework, em Ruby

**Status:** em andamento — tarefa passada em 31/10/2026; exemplo testado no container no mesmo dia.

## Contexto

O [`server.ts`](../../../sandbox/modulo-03/server.ts) do módulo 3 é um `createServer` com uma
função `(req, res) => …`. Ela lê `req.method` e `url.pathname`, decide a rota com `if`, e
termina com `res.writeHead(status, headers)` + `res.end(corpo)`. As rotas são estas:

| Requisição | Resposta |
|---|---|
| `GET /saude` (com ou sem `?origem=monitor`) | `200`, `{ status: "ok" }` |
| `GET /contratos` | `200`, a lista |
| `GET /contratos/1` | `200`, o contrato **com** as parcelas |
| `GET /contratos/01`, `GET /contratos/1/x` | `404` |
| `POST /saude`, `POST /contratos` | `405`, com `Allow: GET` |
| `GET /saude/qualquer-coisa`, `GET /nao-existe` | `404` |

O [`servidor.ts`](../../../sandbox/modulo-03/test/servidor.ts) liga o servidor na porta `0`,
faz `fetch` em cada rota e confere o status. Ele também soma as parcelas devolvidas pela API e
compara com o total do contrato.

O domínio em Ruby está pronto desde a [4.6](../modulo-04/04-6-contract-e-parcelas.md):
`Contract`, `Installment` e `SAMPLE_CONTRACTS`. Esta aula faz a mesma API **sem Rails**, só com o
Rack, a peça sobre a qual o Rails é construído.

## Teoria

O exemplo é de outro domínio, de propósito: uma biblioteca com livros.

### Uma aplicação Rack é um objeto com `call`

```ruby
app = lambda do |env|
  [200, { 'content-type' => 'text/plain' }, ['pong']]
end
```

Essa é a especificação inteira. Uma aplicação Rack é **qualquer objeto que responda a
`call(env)`** e devolva um array de três elementos:

| Posição | O quê | No `node:http` |
|---|---|---|
| `0` | o status, um `Integer` | o 1º argumento do `res.writeHead` |
| `1` | os cabeçalhos, um `Hash` com chaves **minúsculas** | o 2º argumento do `res.writeHead` |
| `2` | o corpo: algo que responda a `each` e entregue `String`s; um array basta | o `res.end(corpo)` |

O `env` é um `Hash` com a requisição já interpretada pelo servidor:

| `env[…]` | Exemplo | No `node:http` |
|---|---|---|
| `'REQUEST_METHOD'` | `'GET'` | `req.method` |
| `'PATH_INFO'` | `'/books/2'` | `url.pathname` |
| `'QUERY_STRING'` | `'lang=pt'` | `url.search`, sem o `?` |

A diferença de desenho é uma só: no Node você **recebe** um `res` e escreve nele. No Rack você
**devolve** a resposta como um valor. Isso torna a aplicação uma função comum, e uma função
comum se testa sem rede (ver abaixo).

### Uma classe também serve

```ruby
# frozen_string_literal: true

require 'json'

# Library API: read-only books, served as JSON.
class LibraryApi
  def call(env)
    _, resource, id, *rest = env['PATH_INFO'].split('/')

    return not_found unless resource == 'books' && rest.empty?
    return method_not_allowed unless env['REQUEST_METHOD'] == 'GET'

    id ? show(id) : index
  end

  private

  def index
    json(200, BOOKS.map { |book| { id: book.id, title: book.title } })
  end

  def show(id)
    book = BOOKS.find { |b| b.id == id }
    book ? json(200, book.to_h) : not_found
  end

  def method_not_allowed
    json(405, { error: 'Method not allowed' }, 'allow' => 'GET')
  end

  def not_found
    json(404, { error: 'Not found' })
  end

  def json(status, body, extra_headers = {})
    [status, { 'content-type' => 'application/json' }.merge(extra_headers), [JSON.generate(body)]]
  end
end
```

O `BOOKS` é um array congelado de `Book = Data.define(:id, :title)`. Testado no container, com
`rack` 3.2.8, `rackup` 2.3.1 e `puma` 8.0.2. O `json` com `extra_headers` é o `responderJson`
do `server.ts`, com o mesmo `headersExtras`.

Quatro coisas para ver:

- **A desestruturação com `*`.** `'/books/2/x'.split('/')` dá `['', 'books', '2', 'x']`. O `_`
  descarta o vazio do começo, e o `*rest` junta o que sobrar. O `rest.empty?` é o que separa
  `/books/2` de `/books/2/x`. No `server.ts` isso era o `if (partes[3])`.
- **Cláusulas de guarda com `return … unless`.** São um `return` cedo, cada um com a sua
  condição. É o único `return` que o estilo Ruby usa de bom grado. Elas substituem o `if`
  aninhado do `server.ts`.
- **Ordem das guardas:** o `404` vem antes do `405`. Um `POST /nao-existe` é `404`, porque o
  recurso não existe. Um `POST /books` é `405`, porque o recurso existe mas não aceita esse
  método.
- **Os cabeçalhos são um `Hash` novo a cada resposta, e não uma constante congelada.** A
  primeira versão deste exemplo tinha `JSON_HEADERS = { … }.freeze` e devolvia esse `Hash`
  direto. Os testes passavam, mas com o servidor no ar toda requisição dava `500`:
  `Rack::Lint::LintError: headers object should not be frozen`. A especificação do Rack 3 deixa
  que as camadas do meio (*middlewares*) acrescentem cabeçalhos, e por isso exige um `Hash`
  mutável. É o único lugar do projeto em que congelar está **errado**.

### JSON: símbolos vão, strings voltam

```ruby
JSON.generate({ id: '2', total_cents: 1_750_000 })   # => '{"id":"2","total_cents":1750000}'
JSON.parse('{"id":"2"}')                             # => {"id" => "2"}
```

Na ida, o `JSON.generate` aceita chaves símbolo e escreve texto. Na volta, o `JSON.parse`
devolve chaves **`String`**. É a diferença entre `:amount` e `"amount"` da
[4.2](../modulo-04/04-2-tudo-e-objeto.md) e da linha 9 do `irb` da 4.3, agora com rede no meio:
`JSON.parse(body)[:id]` é `nil`.

**Como o dinheiro viaja** é uma decisão, e o projeto toma a mesma que tomou no módulo 3: em
**centavos inteiros**, nunca o texto formatado (`"R$ 17.500,00"`) e nunca um `Float`. Quem
recebe reconstrói o `Money` com `Money.from_cents`.

O domínio não sabe nada de HTTP. O `Contract` não ganha `to_json`: quem transforma o contrato num
`Hash` para o JSON é a API. Foi o mesmo motivo do `toJSON` ficar para o Rails na 4.4.

### `config.ru`, `rackup` e Puma

```ruby
# frozen_string_literal: true

require_relative 'library_api'
run LibraryApi.new
```

O `config.ru` diz **qual** objeto atende as requisições. É Ruby, e por isso o RuboCop também
pede o comentário mágico nele. Quem abre a porta é um **servidor**
web, que no projeto é o Puma, o mesmo que o Rails usa. O comando que lê o `config.ru` e liga o
servidor é o `rackup`. A partir do Rack 3, o `rack`, o `rackup` e o `puma` são três gems
separadas, e as três vão para o `Gemfile`.

### A porta, de dentro do container

```bash
docker compose run --rm -p 9292:9292 ruby bundle exec rackup caminho/config.ru -o 0.0.0.0 -p 9292
```

- `-p 9292:9292` (do `docker compose`) publica a porta 9292 do container na 9292 do Windows. Sem
  isso, nada de fora alcança o container.
- `-o 0.0.0.0` (do `rackup`) faz o servidor escutar em todas as interfaces do container. O
  padrão é `localhost`, e o `localhost` **de dentro** do container só aceita conexões de dentro
  dele. O Windows bate na porta e ninguém atende.

Do Windows, num segundo terminal (`curl.exe`, porque no PowerShell `curl` é outro comando):

```text
$ curl.exe -i http://localhost:9292/books/2
HTTP/1.1 200 OK
content-type: application/json
content-length: 35

{"id":"2","title":"Grande Sertão"}
```

O `rackup` sobe em modo `development`, e nesse modo ele embrulha a aplicação em algumas camadas.
Uma delas é o `Rack::Lint`, que confere cada resposta contra a especificação. Foi ele que pegou
os cabeçalhos congelados.

### Testar sem porta: `Rack::MockRequest`

```ruby
require 'minitest/autorun'
require 'rack/mock'
require 'rack/lint'
require 'json'
require_relative '../library_api'

# HTTP behaviour of the library API.
class LibraryApiTest < Minitest::Test
  def setup
    @request = Rack::MockRequest.new(Rack::Lint.new(LibraryApi.new))
  end

  def test_post_to_books_is_not_allowed
    response = @request.post('/books')

    assert_equal 405, response.status
    assert_equal 'GET', response.headers['allow']
  end
end
```

No módulo 3, testar o servidor exigia ligá-lo na porta `0` e fazer `fetch`. Aqui, como a
aplicação é um objeto com `call`, o `Rack::MockRequest` monta o `env`, chama o `call` e embrulha
a resposta, sem rede e sem servidor. O `response.body` é a `String` do corpo.

O `Rack::Lint.new(…)` em volta da aplicação traz para o teste a conferência que o `rackup` faz
no servidor. Sem ele, o `MockRequest` aceita cabeçalhos congelados, e a suíte fica verde para
uma API que responde `500` no ar.

## Tarefa

1. **Gems.** Pelo container, `bundle add` do `rack`, do `rackup` e do `puma`. Confira no
   `Gemfile.lock` as versões e as três plataformas.

2. **`sandbox/modulo-05/contracts_api.rb`**: classe `ContractsApi`, com as rotas da tabela do
   Contexto, em inglês:
   - `GET /health` → `200`, `{ "status": "ok" }`. A *query string* não muda nada.
   - `GET /contracts` → `200`, a lista **sem** as parcelas: `id`, `vendor`, `total_cents` e
     `installment_count`.
   - `GET /contracts/:id` → `200`, o mesmo **mais** `installments`: `[{ "number": 1,
     "amount_cents": 64815 }, …]`.
   - id inexistente, id `01`, caminho a mais (`/contracts/1/x`, `/health/x`) e rota
     desconhecida → `404`, com `{ "error": "…" }`.
   - qualquer método que não seja `GET` em `/health` ou `/contracts` → `405`, com o cabeçalho
     `allow: GET`.
   - os contratos vêm do `SAMPLE_CONTRACTS` da 4.6 (`require_relative`). O domínio não muda.
     Nenhum `to_json` ou `to_h` novo no `Contract`, no `Money` ou no `Installment`.

3. **`sandbox/modulo-05/config.ru`**, e a API no ar pelo comando da teoria. Do Windows, com o
   `curl.exe -i`: `/health`, `/contracts`, `/contracts/1`, `/contracts/99`, e um `POST` em
   `/health` (`curl.exe -i -X POST …`). Guarde as saídas.

4. **Sem `-o 0.0.0.0`.** Suba de novo sem a opção e rode o `curl.exe`. O servidor sobe normal
   (o log do Puma não reclama), mas o `curl.exe` responde `(52) Empty reply from server`. Guarde
   a saída e explique por quê.

5. **`sandbox/modulo-05/test/contracts_api_test.rb`**, com `Rack::MockRequest` em volta de um `Rack::Lint`, e o `Rakefile`
   passando a incluir os testes de `modulo-05`. Os casos do `servidor.ts`, mais os que a tabela
   pede:
   - cada linha da tabela do Contexto, com o status;
   - o `405` confere o `allow`;
   - o `content-type` é `application/json`;
   - `GET /contracts` devolve 2 contratos;
   - `GET /contracts/1`: a soma dos `amount_cents` das parcelas, reconstruídas com
     `Money.from_cents`, é igual ao `total` do contrato **local**. É o teste que, no TS, passou
     pelo `Money.deJSON`;
   - nenhum teste olha a mensagem do `error`: o contrato com quem chama é o status.

6. **Prova de estragar**, com a suíte verde:
   - inverta a ordem das guardas (`405` antes do `404`). Que teste cai? Qual seria a resposta
     de um `POST /nao-existe`?
   - tire o teste do caminho a mais (`rest.empty?`, ou o que você usou). O que `/contracts/1/x`
     passa a responder?

   Desfaça as duas trocas.

7. **Commits:** `chore:` para as gems e o `Rakefile`, `feat:` para a API e o `config.ru`, `test:`
   para os testes. **Rode o `rake` antes de cada um.**

## Verificação

```bash
docker compose run --rm ruby bundle exec rake
```

`0 failures, 0 errors`: os 40 testes do módulo 4 mais os novos.

```bash
docker compose run --rm ruby bundle exec rubocop
```

`no offenses detected`.

Do Windows, com a API no ar (item 3):

```text
$ curl.exe -i http://localhost:9292/health
HTTP/1.1 200 OK
content-type: application/json
…
{"status":"ok"}
```

## Perguntas para responder em voz alta

1. **O que é uma aplicação Rack? Compare o `call(env)` com o `(req, res) => …` do
   `createServer`: o que um recebe e devolve que o outro não?**
2. **Por que o teste do módulo 3 precisava de porta e este não precisa?**
3. **O que o `-o 0.0.0.0` resolve, e por que o problema não existia no módulo 3, rodando o Node
   direto no Windows?**
4. **`JSON.parse(body)[:id]` dá `nil`. Por quê, e em que aula isso já apareceu?**

## Pendências herdadas

- O teste do módulo 3 tipava o resultado do `json()` como `Contrato[]` sem conferir nada. Em
  Ruby não há tipo para mentir. O equivalente é **conferir o conteúdo** no item 5, não só o
  status.
