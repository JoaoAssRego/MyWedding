---
tipo: aula
modulo: 5
aula: "5.3"
status: concluida
conceitos:
  - routes
  - controller
  - render-json
  - zeitwerk
  - app-domain
  - integration-test
tags:
  - curso/aula
  - curso/modulo-05
---

# Aula 5.3 — Rotas, controllers e JSON: a API da 5.1 dentro do Rails

**Status:** concluída em 24/11/2026, na segunda revisão.

## Contexto

A [5.2](05-2-rails-new.md) deixou o Rails no ar com uma rota só, o `/up`. A
[5.1](05-1-rack.md) tem a API inteira em Rack puro: `/health` e `/contracts`, com o domínio do
módulo 4. Esta aula leva os dois para dentro do Rails:

- o domínio (`Money`, `Installment`, `Contract`) vai para `apps/api/app/domain/`, como o
  [README do projeto](../../../README.md) planejou: regra de negócio sem ActiveRecord e sem I/O;
- as rotas da 5.1 viram `config/routes.rb` e dois *controllers*;
- os testes do `Rack::MockRequest` viram testes de integração do Rails.

Os dados ainda vêm de uma constante em memória. O Postgres entra na 5.4.

O roteiro foi testado no container em 08/11/2026, numa cópia do `apps/api`, já apagada. Três
coisas apareceram, e as três estão na teoria: o Zeitwerk recusando o `sample_contracts.rb`, o
banco de teste que não existe, e o Rails respondendo `404` onde a 5.1 respondia `405`.

## Teoria

O exemplo continua sendo a biblioteca da 5.1.

### Do `dispatch` ao `routes.rb`

```ruby
Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  get "ping", to: "ping#show"
  resources :books, only: %i[index show]
end
```

```text
$ bin/rails routes -g book
Prefix Verb URI Pattern          Controller#Action
 books GET  /books(.:format)     books#index
  book GET  /books/:id(.:format) books#show
```

| Na 5.1 | No Rails |
|---|---|
| `_, resource, id, *rest = path.split('/')` | o padrão `/books/:id` |
| `rest.empty?` (caminho a mais → `404`) | nenhuma rota casa com `/books/1/x` → `404` sozinho |
| `id ? show(id) : index` | `books#show` ou `books#index` |
| `id` | `params[:id]`, **sempre uma `String`** |

O `resources :books, only: %i[index show]` é o atalho para as duas linhas `get`. Sem o `only:`,
ele criaria as sete ações (`create`, `update`, `destroy`…), e rota que não existe no
*controller* responde erro em vez de `404`.

### O *controller*

```ruby
class BooksController < ApplicationController
  def index
    render json: Library::BOOKS.map { |book| { id: book.id, title: book.title } }
  end

  def show
    book = Library::BOOKS.find { |b| b.id == params[:id] }
    return render json: { error: "Not found" }, status: :not_found unless book

    render json: book.to_h
  end
end
```

- Cada **ação** é um método público. O Rails cria um objeto novo do *controller* para cada
  requisição e chama a ação que a rota indicou.
- `render json:` faz o `JSON.generate`, põe o `content-type: application/json` e escolhe o
  status, `200` se nada for dito. `status: :not_found` é o `404`, pelo nome.
- `return render … unless book` é a guarda da 5.1, agora com o `render`. Sem o `return`, o
  método seguiria para o segundo `render` e o Rails lançaria `AbstractController::DoubleRenderError`.
- O estilo do RuboCop da aplicação Rails é o **omakase**: aspas duplas, espaço dentro de
  `%i[ ]`, e outras diferenças em relação ao sandbox. Cada pasta segue o seu
  `.rubocop.yml`.

### `app/domain` e o Zeitwerk

Tudo o que fica em `app/*/` é carregado sozinho pelo **Zeitwerk**, sem `require_relative`. O
preço é uma regra de nomes: **o arquivo `app/domain/sample_contracts.rb` tem que definir a
constante `SampleContracts`**. Uma constante com outro nome no arquivo quebra:

```text
$ bin/rails zeitwerk:check
expected file app/domain/sample_contracts.rb to define constant SampleContracts, but didn't
```

É o que acontece com o `SAMPLE_CONTRACTS` da 4.6 copiado como está. O conserto é um módulo com
o nome do arquivo, e a constante dentro dele:

```ruby
module Library
  BOOKS = [Book.new(id: "1", title: "Dom Casmurro")].freeze
end
```

(`app/domain/library.rb`, usado como `Library::BOOKS`). Os `require_relative` entre os arquivos
do domínio também saem, porque quem carrega agora é o Zeitwerk.

> [!important] Copiar, e não mover, desta vez
> O "Padrão a vigiar" do [onde-estou](../onde-estou.md#padrão-a-vigiar) é a cópia que apodrece.
> Aqui a cópia é de propósito: o `sandbox/modulo-04/` é o **registro** do módulo 4 e não muda
> mais. A partir desta aula, a fonte do domínio é `apps/api/app/domain/`. Correção de regra
> de negócio se faz lá.

### Teste de integração

```ruby
require "test_helper"

class BooksTest < ActionDispatch::IntegrationTest
  test "show returns one book" do
    get "/books/1"

    assert_response :ok
    assert_equal "Dom Casmurro", response.parsed_body["title"]
  end
end
```

- `ActionDispatch::IntegrationTest` faz o caminho inteiro: as 19 camadas, a rota, o
  *controller*, o JSON. É o `Rack::MockRequest` da 5.1, sem precisar montar nada.
- `test "…" do` é o `def test_…` do Minitest com um nome legível. Por baixo é o mesmo Minitest
  da 4.5.
- `response.parsed_body` faz o `JSON.parse`, e as chaves vêm como `String`.
- Os testes moram em `apps/api/test/integration/` e rodam com `bin/rails test`.

**O banco de teste ainda não existe.** Com `DATABASE_URL` definida, o `db:create` da 5.2 criou só
o banco do ambiente em que rodou (`development`). Uma suíte com teste de verdade tenta conectar
no `my_wedding_test` e quebra com `ActiveRecord::NoDatabaseError`. A suíte vazia da 5.2 passou
porque não chegou a conectar. Uma vez só:

```bash
docker compose run --rm -e RAILS_ENV=test api bin/rails db:create
```

### `404` onde a 5.1 dava `405`

```text
POST /contracts  →  404
POST /health     →  404
```

O roteador do Rails procura uma rota que case **verbo e caminho** juntos. Não existe
`POST /contracts`, então não há rota, e a resposta é `404`. Ele não pergunta "esse caminho
existe com outro verbo?", que era o que a sua guarda do `405` fazia. Dá para responder `405`
no Rails, mas dá trabalho, e quase nenhuma API Rails faz isso. Nesta aula, fica a resposta
padrão do Rails, e os testes de `405` da 5.1 viram testes de `404`.

## Tarefa

1. **Banco de teste:** crie o `my_wedding_test` com o comando da teoria.

2. **Domínio em `apps/api/app/domain/`:**
   - `money.rb`, `installment.rb` e `contract.rb`, copiados do `sandbox/modulo-04/` sem os
     `require_relative`;
   - `sample_contracts.rb` com `module SampleContracts` e a constante `ALL`, congelada;
   - os testes do domínio (`money`, `money_split`, `installment`, `contract`) vão para
     `apps/api/test/domain/`, com `require "test_helper"` no lugar dos `require_relative`;
   - `bin/rails zeitwerk:check` → `All is good!`.

3. **Rotas e *controllers*:** `GET /health` → `{ "status": "ok" }`, e `GET /contracts` e
   `GET /contracts/:id` com o mesmo JSON da 5.1 (a lista sem `installments`, o detalhe com elas).
   O id inexistente devolve `404` com `{ "error": "…" }`.

4. **Testes de integração** em `apps/api/test/integration/`, com os casos da 5.1:
   - todos os status, incluindo `/contracts/01`, `/contracts/99` e `/contracts/1/x` → `404`, e
     `POST /contracts` e `POST /health`, agora → `404`;
   - `GET /contracts` com 2 contratos e **sem** `installments`;
   - `GET /contracts/2`: `vendor` `"Gauss"`, `total_cents` `390000`, 20 parcelas, e a soma dos
     `amount_cents` igual a `390000`. São valores escritos no teste, e não uma cópia da
     lógica do *controller* (a pendência da 5.1).

5. **No ar:** `docker compose up api` e `curl.exe -i` em `/health`, `/contracts` e
   `/contracts/2`.

6. **Prova de estragar:** tire o `return` da guarda do `show` e peça `/contracts/99`. Que erro
   aparece, e qual teste cai? Desfaça.

7. **Commits:** `feat:` para o domínio e os testes dele, `feat:` para rotas, *controllers* e
   testes de integração. Antes de cada um, `bin/rails test` e `bin/rubocop`.

## Verificação

```bash
docker compose run --rm api sh -c 'bin/rails zeitwerk:check && bin/rails test && bin/rubocop'
```

`All is good!`, `0 failures, 0 errors` (os 40 testes do domínio mais os de integração) e
`no offenses detected`.

```text
$ curl.exe -i http://localhost:3000/contracts/2
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
…
{"id":"2","vendor":"Gauss","total_cents":390000,"installment_count":20,"installments":[…]}
```

## Para a revisão oral do módulo

No [README do módulo](README.md#revisão-oral-de-fechamento): por que o Zeitwerk exige que o nome
do arquivo bata com o da constante; e por que o Rails responde `404`, e não `405`, para
`POST /contracts`.

## O que aconteceu

### Conferência — 23/11/2026: o que falta (nada commitado ainda)

A pedido do João, conferido no container sobre a árvore de trabalho:

- `bin/rails zeitwerk:check` → `All is good!` (`module SampleContracts` com `ALL`). Fecha.
- `bin/rubocop` → limpo.
- **`bin/rails test` trava.** Com 52 testes, o Rails passa do limite de 50 e roda em paralelo,
  e cada processo cria o próprio banco (`my_wedding_test-0`, `-1`…) carregando o
  `db/schema.rb`. O arquivo ainda não existe
  (`db/schema.rb doesn't exist yet. Run bin/rails db:migrate`), e a suíte para. Com
  `PARALLEL_WORKERS=1`: `52 runs, 0 failures, 15 errors`.
- **15 erros nos testes do domínio:** `NameError: uninitialized constant …::SAMPLE_CONTRACTS`.
  O `contract_test.rb` e o `installment_test.rb` ainda usam o nome da 4.6, e agora é
  `SampleContracts::ALL`.
- **O `rake` da raiz quebrou.** O domínio e os testes foram **movidos** do `sandbox/modulo-04/`
  (8 arquivos apagados), e a aula pedia **cópia**. O `sandbox/modulo-05/contracts_api.rb` da 5.1
  faz `require_relative '../modulo-04/contract'` e não carrega mais. É o "Padrão a vigiar", na
  direção contrária.
- Rotas: o João foi além da aula e respondeu `405` com `match … via: :all` para
  `#method_not_allowed`, e os testes esperam `405`. Funciona, e fica.

Pendências, sem bloquear: `ContractController` no singular, com `health` dentro (o Rails espera
`ContractsController`, e o `health` no próprio *controller*); o teste do `/contracts/2` ainda
monta o esperado copiando a lógica (`expected_contract_summary`), e a tarefa pedia valores
escritos (`"Gauss"`, `390000`, 20); o `require "minitest/autorun"` sobrando no `contract_test.rb`.

### Erro ao abrir `/contracts/1` — 24/11/2026

O log mostrou `ActionDispatch::MissingController (uninitialized constant ContractsController)`.
A rota aponta para `contracts#contract`, então o Rails procura `ContractsController`. A classe
já se chama `ContractsController`, mas está em `app/controllers/contract_controller.rb`; o
Zeitwerk espera encontrá-la em `app/controllers/contracts_controller.rb`. Renomear o arquivo
para o plural deve resolver esse erro. A aplicação ainda não foi alterada nesta sessão.

### Revisão 1 — 24/11/2026: falta só limpar e commitar

Ainda **sem commit** de código. Verificado no container:

- `db/schema.rb` gerado pelo `db:migrate`: o `bin/rails test` voltou a rodar em paralelo (8
  processos) e terminou com **`52 runs, 94 assertions, 0 failures, 0 errors`**. O travamento era
  mesmo o `schema.rb` faltando.
- `SampleContracts::ALL` nos testes do domínio; `ContractsController` e `HealthController`
  separados; `405` mantido com `match … via: :all`.
- `curl.exe`: `/health`, `/contracts` (sem parcelas) e `/contracts/2` (Gauss, 20 × 19500)
  conferem.
- **Prova de estragar:** sem o `return`, o `/contracts/99` dá
  `NoMethodError: undefined method 'id' for nil`, e o teste do id inexistente cai. O `render`
  não encerra o método. Fecha.

**Falta, e bloqueia:**

1. **`sandbox/modulo-04/test/` foi sobrescrito** com as versões do Rails
   (`require "test_helper"`, aspas duplas). O `rake` da raiz quebra com
   `cannot load such file -- test_helper`, e o RuboCop da raiz acusa 34 infrações. Os arquivos
   do domínio no sandbox voltaram certos, e só os 4 testes ficaram com a versão nova.
2. `bin/rubocop` da `api`: 4 infrações de espaço e quebra de linha, todas corrigíveis com `-a`.
3. Os commits.

### Revisão 2 — 24/11/2026: fecha

Commits `bea5ba7` (`chore:` `db/schema.rb`), `a66cf53` (`feat:` domínio e testes),
`d8eeb22` (`feat:` *controllers*, rotas e testes) e `b7cdffe` (`docs:`). Árvore limpa.
Verificado no container:

- `apps/api`: `zeitwerk:check` → `All is good!`; `bin/rails test` → **`52 runs, 94 assertions,
  0 failures, 0 errors`** (em paralelo); `bin/rubocop` → `32 files, no offenses`.
- raiz: `bundle exec rake` → `52 runs, 0 failures` (o `sandbox/modulo-04/test/` voltou ao
  original); RuboCop → `17 files, no offenses`.
- O `MissingController` registrado acima foi resolvido no commit: o arquivo é
  `contracts_controller.rb`.

Pendências, sem bloquear: o `expected_contracts`/`expected_contract_summary` do teste da lista
ainda copia a lógica (o do Gauss já usa valores escritos); assuntos de commit longos (*"implement
Contract, Installment, and Money classes with validations and sample contracts"*) para o que é
"move domain into the Rails app".
