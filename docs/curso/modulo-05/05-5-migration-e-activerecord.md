---
tipo: aula
modulo: 5
aula: "5.5"
status: em-andamento
conceitos:
  - migration
  - schema-rb
  - activerecord-model
  - check-constraint
  - fixtures
  - seeds
tags:
  - curso/aula
  - curso/modulo-05
---

# Aula 5.5 — Migration × SQL, e o ActiveRecord lendo os contratos

**Status:** em andamento — tarefa passada em 26/11/2026.

## Contexto

Na [5.4](05-4-sql-a-mao.md) você escreveu a tabela `contracts` à mão, no `sql_lab`. A API ainda
lê os contratos do `SampleContracts::ALL`, uma constante em memória
([5.3](05-3-rotas-e-controllers.md)). Esta aula liga as duas pontas:

- a mesma tabela, agora criada por uma *migration* no `my_wedding_development`, e comparada com
  o seu `contracts.sql`;
- um *model* `Contract` do ActiveRecord, e o *controller* lendo dele;
- os dois contratos de exemplo saindo do código: viram `db/seeds.rb` (desenvolvimento) e
  *fixtures* (testes).

O roteiro foi testado no container em 26/11/2026, numa cópia do `apps/api` e em bancos
descartáveis, já apagados. A teoria traz o que o teste mostrou.

## Teoria

### O `Contract` não pode ter dois donos

```text
$ bin/rails g model Contract vendor:text total_cents:bigint installment_count:integer
The name 'Contract' is either already used in your application or reserved by Ruby on Rails.
```

O `app/domain/contract.rb` já define `Contract`. O Zeitwerk carrega **um** arquivo por constante,
e o gerador recusa a colisão.

A decisão desta aula: **o contrato vira *model***. Ele é uma entidade, tem `id`, nasce e é
guardado no banco, e por isso vive em `app/models/`. Os *value objects* continuam em
`app/domain/`, sem banco nenhum: o `Money` e o `Installment`. É a divisão que o
[README](../../../README.md) desenhou: `app/domain` para regra que se testa com uma chamada de
método, e `app/models` para persistência.

Antes de gerar, saem `app/domain/contract.rb` e `app/domain/sample_contracts.rb`, e também os
testes que dependiam deles (`contract_test.rb` e `installment_test.rb` em `test/domain/`). O
`installment_test.rb` usava o `SampleContracts`, e os testes do `Installment` sozinho podem
ficar, desde que não dependam de um contrato.

### A *migration*

O gerador escreve um esqueleto, sem nenhuma regra:

```ruby
create_table :contracts do |t|
  t.text :vendor
  t.bigint :total_cents
  t.integer :installment_count

  t.timestamps
end
```

As regras da 5.4 entram por você, como neste exemplo do livro (o mesmo `books` da 5.4):

```ruby
create_table :books do |t|
  t.text :title, null: false
  t.bigint :price_cents, null: false
  t.integer :pages, null: false

  t.timestamps

  t.check_constraint "price_cents >= 0", name: "books_price_cents_check"
  t.check_constraint "price_cents >= pages", name: "price_covers_pages"
end
```

- `null: false` é o `NOT NULL`.
- `t.check_constraint "expressão SQL", name:` é o `CHECK`. A expressão é SQL puro, a mesma que
  você escreveu na 5.4.
- `t.timestamps` cria `created_at` e `updated_at`, e o ActiveRecord preenche os dois sozinho.

`bin/rails db:migrate` roda a *migration* e reescreve o `db/schema.rb`, que é a fotografia do
banco depois de todas as *migrations*. Ele vai para o Git, como o `Gemfile.lock`.

### O que o Rails gerou, comparado com o seu SQL

```text
$ docker compose exec db psql -U postgres -d my_wedding_development -c '\d contracts'
 id          | bigint                         | not null | nextval('contracts_id_seq'::regclass)
 created_at  | timestamp(6) without time zone | not null |
```

Duas diferenças em relação ao seu `contracts.sql`, e as duas são escolhas do Rails:

| Coluna | 5.4 (à mão) | Rails |
|---|---|---|
| `id` | `GENERATED ALWAYS AS IDENTITY` | `bigint` com `nextval` de uma *sequence* (o `bigserial`) |
| `created_at` | `timestamptz` | `timestamp(6) without time zone`, sempre gravado em UTC pelo Rails |

As duas formas de `id` dão o mesmo resultado prático. O `timestamp` sem fuso só fica correto
porque o Rails grava tudo em UTC, então quem escrever no banco por fora do Rails precisa saber
disso. Os três `CHECK` saem iguais aos seus.

### O *model*

```ruby
class Book < ApplicationRecord
  def price
    Money.from_cents(price_cents)
  end
end
```

- `ApplicationRecord` lê as colunas da tabela `books` **no banco**, quando a aplicação sobe. Não
  há `attr_reader`: `book.title` e `book.price_cents` existem porque as colunas existem.
- O banco guarda `price_cents`, um `Integer`. O *model* devolve um `Money`. Assim o resto do
  código continua falando a língua do módulo 4.
- `Book.order(:id)`, `Book.find_by(id: …)`, `Book.count`, `Book.create!(…)` são as consultas
  básicas, e cada uma vira um `SELECT` ou um `INSERT`. O log do `bin/rails server` mostra o SQL
  de cada uma.

### O que muda quando o dado vem do banco

Rodado na cópia de teste:

```text
Contract.find_by(id: "01")                      # => o contrato de id 1
Contract.create!(…, total_cents: 5, installment_count: 10)
  # => ActiveRecord::CheckViolation: … violates check constraint "total_cents_cover_installment_count"
Contract.new(…, total_cents: 49.9).total_cents   # => 49
```

- **O `id` é número.** O `find_by` converte `"01"` em `1`. Em desenvolvimento, com o seed,
  `/contracts/01` passa a responder o contrato 1, onde a 5.3 respondia `404`. No teste, o mesmo
  pedido continua `404`, mas só porque as *fixtures* não têm `id` 1 (ver abaixo). Isso é um
  teste que passa por acaso.
- **O `CHECK` do banco vira exceção do Ruby:** `ActiveRecord::CheckViolation`. Sem tratamento,
  é um `500`. Validação com mensagem para o usuário (`422`) é a 5.6.
- **O ActiveRecord trunca:** `49.9` vira `49`. Na 5.4, o Postgres arredondava para `50`. São duas
  camadas convertendo o mesmo `Float` de jeitos diferentes, e é mais um motivo para o `Float`
  nunca chegar até aqui.

### `seeds.rb` e *fixtures*

- `db/seeds.rb` popula o banco de **desenvolvimento** (`bin/rails db:seed`). Use
  `find_or_create_by!`, para poder rodar de novo sem duplicar.
- `test/fixtures/contracts.yml` popula o banco de **teste** antes de cada teste:

  ```yaml
  photographer:
    vendor: Gauss
    total_cents: 390000
    installment_count: 20
  ```

  No teste, `contracts(:photographer)` devolve esse registro. O `id` de uma *fixture* é um número
  grande calculado a partir do nome (`372472447`, por exemplo), e não `1` ou `2`. Por isso o
  teste pede `"/contracts/#{contracts(:photographer).id}"`, e não `"/contracts/2"`. Pelo mesmo
  motivo, `order(:id)` não segue a ordem do arquivo `.yml`.

## Tarefa

1. **Tirar o contrato do domínio:** apague `app/domain/contract.rb`,
   `app/domain/sample_contracts.rb` e `test/domain/contract_test.rb`. O `installment_test.rb`
   passa a criar os próprios `Installment`, sem `SampleContracts`.

2. **Gerar e completar:** `bin/rails g model Contract vendor:text total_cents:bigint
   installment_count:integer`. Na *migration*, acrescente `null: false` nas três colunas e os três
   `CHECK` da 5.4, com os mesmos nomes. Depois rode `bin/rails db:migrate`.

3. **Comparar:** `\d contracts` no `my_wedding_development` e no `sql_lab`. Anote as diferenças.

4. **O *model*:** `total`, que devolve um `Money`, e `installments`, que devolve os
   `Installment` numerados a partir de 1 (a mesma lógica do `Contract` que saiu do domínio).

5. **Dados:** os dois contratos em `db/seeds.rb` (`bin/rails db:seed`) e em
   `test/fixtures/contracts.yml`, com nomes (`salon`, `photographer`).

6. **O *controller*:** `Contract.order(:id)` na lista e `Contract.find_by(id: params[:id])` no
   detalhe. O JSON continua o mesmo, com uma diferença: o `id` agora é número.

7. **Testes:**
   - os de integração usam as *fixtures* (`contracts(:photographer)`), e não `SampleContracts`
     nem `id` escrito à mão;
   - a lista não pode depender da ordem dos `id` das *fixtures*;
   - o `/contracts/01` passa a montar o caminho a partir de um `id` que existe
     (`"/contracts/0#{contracts(:salon).id}"`), e você decide e registra o que ele deve
     responder;
   - em `test/models/contract_test.rb`: `total` é um `Money`, as parcelas somam o total, e criar
     um contrato com 5 centavos em 10 parcelas lança `ActiveRecord::CheckViolation`.

8. **No ar:** `docker compose up api` e `curl.exe -i` em `/contracts` e no `/contracts/:id` do
   Gauss, com os `id` que o seed criou.

9. **Prova de estragar:** tire o `CHECK` do total cabendo nas parcelas da *migration*, rode
   `bin/rails db:rollback` e `bin/rails db:migrate`, e depois os testes. Qual teste cai? Desfaça,
   com o mesmo `rollback` e `migrate`.

10. **Commits:** `refactor:` para tirar o contrato do domínio, `feat:` para a *migration*, o
    *model*, o `schema.rb`, o seed e as *fixtures*, e `feat:` para o *controller* e os testes. O
    `bin/rails test` tem que passar **antes de cada um**: confira se o primeiro commit não quebra
    a suíte.

## Verificação

```bash
docker compose run --rm api sh -c 'bin/rails zeitwerk:check && bin/rails test && bin/rubocop'
```

`All is good!`, `0 failures, 0 errors` e `no offenses detected`.

```bash
docker compose exec db psql -U postgres -d my_wedding_development -c '\d contracts'
```

As colunas `NOT NULL` e os três `CHECK`, com os nomes da 5.4.

## Para a revisão oral do módulo

No [README do módulo](README.md#revisão-oral-de-fechamento): por que o contrato saiu de
`app/domain` e o `Money` ficou; o que o `schema.rb` é e por que vai para o Git; e por que
`/contracts/01` encontra o contrato 1.
