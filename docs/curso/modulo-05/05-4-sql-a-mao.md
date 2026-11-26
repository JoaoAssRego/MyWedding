---
tipo: aula
modulo: 5
aula: "5.4"
status: concluida
conceitos:
  - psql
  - create-table
  - bigint
  - check-constraint
  - not-null
  - identity
  - generate-series
tags:
  - curso/aula
  - curso/modulo-05
---

# Aula 5.4 — SQL à mão: a tabela `contracts` no Postgres

**Status:** concluída em 26/11/2026, na segunda revisão.

## Contexto

Os contratos da API ainda vêm de uma constante em memória, o `SampleContracts::ALL` da
[5.3](05-3-rotas-e-controllers.md). O Postgres está no Compose desde a [5.2](05-2-rails-new.md),
vazio.

Antes de deixar o Rails criar tabelas (5.5), esta aula escreve uma tabela **à mão**, em SQL, num
banco separado de laboratório. É o que o [ADR 0001](../../adr/0001-use-rails-for-the-api.md)
combinou: _"migrations are read against the SQL they generate"_. Na 5.5, o SQL que o Rails gerar
vai ser comparado com o que você escreveu aqui.

As regras que o Ruby garante hoje (`Money` não negativo, `installment_count >= 1`, o total
cabendo nas parcelas) vão ser escritas de novo, agora **no banco**, como `CHECK`. É a primeira
resposta concreta à pendência _"`Money` pode ser negativo?"_.

O roteiro foi testado num Postgres 18.6 descartável em 24/11/2026.

## Teoria

O exemplo é uma tabela de livros. Testada no container, é a mesma forma que a tarefa pede.

### `psql` no container

```bash
docker compose exec db psql -U postgres
```

Esse comando abre o cliente dentro do container do `db`. Alguns comandos do próprio `psql`, que
começam com `\` e não são SQL:

| Comando      | O quê                                              |
| ------------ | -------------------------------------------------- |
| `\l`         | lista os bancos                                    |
| `\c sql_lab` | conecta em outro banco                             |
| `\dt`        | lista as tabelas                                   |
| `\d books`   | descreve uma tabela: colunas, tipos, _constraints_ |
| `\q`         | sai                                                |

Com `-d sql_lab -f arquivo.sql`, o `psql` roda um arquivo inteiro e sai. O container do `db` não
enxerga o repositório, então a pasta dos arquivos `.sql` precisa estar montada nele (item 1 da
tarefa).

### `CREATE TABLE`, tipos e regras

```sql
DROP TABLE IF EXISTS books;

CREATE TABLE books (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title       text   NOT NULL,
  price_cents bigint NOT NULL CHECK (price_cents >= 0),
  pages       integer NOT NULL CHECK (pages >= 1),
  CONSTRAINT price_covers_pages CHECK (price_cents >= pages),
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

- **`bigint` para centavos.** É inteiro de 64 bits, o mesmo `BIGINT` que o
  [README](../../../README.md) decidiu. `integer` (32 bits) para em R$ 21 milhões, o que é pouco
  para uma tabela de valores. `numeric` aceitaria fração de centavo, e `real`/`double` são o
  `Float` que o módulo 1 inteiro evitou.
- **`GENERATED ALWAYS AS IDENTITY`** é o auto-incremento do padrão SQL: o banco escolhe o `id`,
  e um `INSERT` que tente escolher é recusado.
- **`NOT NULL`** é o `nil` que não entra. Sem ele, toda coluna aceita `NULL`.
- **`CHECK`** numa coluna só vem junto dela. Um `CHECK` que compara **duas** colunas fica
  numa linha própria, e com `CONSTRAINT nome` ele ganha um nome legível na mensagem de erro.
- **`timestamptz`** guarda o instante em UTC e converte na leitura. É o tipo que o Rails usa.

### As regras, provadas pelo banco

Rodado no Postgres de teste:

```text
INSERT … VALUES ('Negative', -1, 10);
ERROR:  new row for relation "books" violates check constraint "books_price_cents_check"

INSERT … VALUES ('Too cheap', 5, 10);
ERROR:  new row for relation "books" violates check constraint "price_covers_pages"

INSERT … VALUES (NULL, 100, 10);
ERROR:  null value in column "title" of relation "books" violates not-null constraint

INSERT INTO books (id, …) VALUES (99, …);
ERROR:  cannot insert a non-DEFAULT value into column "id"

INSERT … VALUES ('Float', 49.9, 10);
INSERT 0 1
```

O último **passou**. O Postgres converteu `49.9` para `bigint` arredondando, e gravou `50`, sem
erro e sem aviso. Um `CHECK` protege uma regra que você escreveu. Ele não protege contra
conversão de tipo. É a mesma armadilha do `Float` do módulo 1, agora no banco: o valor chega
errado e ninguém reclama. A defesa continua sendo **nunca mandar `Float`**, e o `Money` do Ruby
já recusa um `Float` antes de chegar aqui.

Repare também nos `id` das mensagens de `DETAIL`: as tentativas que falharam **gastaram** números
(3, 4, 5…). O `id` identifica uma linha. Ele não conta linhas e pode ter buracos.

### Uma regra de negócio em SQL

A divisão em parcelas do módulo 1, com o resto nas primeiras, cabe numa consulta:

```sql
SELECT n AS number,
       price_cents / pages
         + CASE WHEN n <= price_cents % pages THEN 1 ELSE 0 END AS amount_cents
FROM books, generate_series(1, pages) AS n
WHERE id = 1;
```

- `generate_series(1, pages)` gera uma linha para cada número de 1 até `pages`. É o
  `Array.new(count) { |i| … }` da 4.3.
- Em SQL, `/` entre dois inteiros é divisão inteira, como em Ruby, e `%` é o resto.
- O `n` começa em 1, então a condição é `n <= resto`. No Ruby da 4.3, com `i` começando em 0, era
  `i < remainder`.

Se a soma dos `amount_cents` bater com o total, a regra está igual à do Ruby. A tarefa pede que
você confira.

## Tarefa

1. **Montar a pasta no `db`.** No serviço `db` do `compose.yaml`, monte
   `./sandbox/modulo-05/sql` em `/sql`, só leitura (`:ro`). Depois rode `docker compose up -d db`.

2. **O banco de laboratório:** `CREATE DATABASE sql_lab;` pelo `psql`. Nada desta aula toca o
   `my_wedding_development`: ele é do Rails, a partir da 5.5.

3. **`sandbox/modulo-05/sql/contracts.sql`**, que pode rodar várias vezes (`DROP TABLE IF EXISTS`
   no começo):
   - a tabela `contracts`: `id` _identity_, `vendor` texto obrigatório, `total_cents` `bigint`
     não negativo, `installment_count` `integer >= 1`, um `CHECK` com nome dizendo que o total
     cabe nas parcelas, e `created_at`;
   - os dois contratos (Casarão do Paraíso, `1750000` em 27; Gauss, `390000` em 20);
   - um `SELECT` dos dois;
   - a consulta das parcelas do Casarão com `generate_series`, mostrando as parcelas 1, 22, 23 e
     27, e outra consulta com a **soma** das 27.

4. **`sandbox/modulo-05/sql/violations.sql`:** um `INSERT` por regra, cada um tentando quebrar
   uma delas: total negativo, `installment_count` 0, 5 centavos em 10 parcelas, `vendor` nulo, `id`
   escolhido à mão. Mais um `INSERT` com total `1750000.4`. No fim, `SELECT count(*)`.

5. **Rodar e guardar as saídas:**

   ```bash
   docker compose exec db psql -U postgres -d sql_lab -f /sql/contracts.sql
   docker compose exec db psql -U postgres -d sql_lab -f /sql/violations.sql
   docker compose exec db psql -U postgres -d sql_lab -c '\d contracts'
   ```

6. **Prova de estragar:** tire o `CHECK` do "total cabe nas parcelas", rode o `contracts.sql` e
   depois o `violations.sql`. Qual `INSERT` passa a ser aceito, e o que a consulta de parcelas
   mostraria para esse contrato? Desfaça.

7. **Commits:** `chore:` para o `compose.yaml`, `feat:` para os dois `.sql`.

## Verificação

- Na parcela do Casarão, a 1 e a 22 valem `64815` e a 23 e a 27 valem `64814`. A soma das 27 é
  `1750000`.
- O `violations.sql` mostra **5** linhas `ERROR`, uma por regra, e o `count` final é `3`. O
  `1750000.4` entra, arredondado.
- O `\d contracts` lista os três `CHECK`, com o seu nome no do total.

## Para a revisão oral do módulo

No [README do módulo](README.md#revisão-oral-de-fechamento): o que um `CHECK` no banco garante
que o `Money` do Ruby não garante; e por que o `1750000.4` entrou sem erro.

## O que aconteceu

### Revisão 1 — 25/11/2026: falta a prova de estragar e o commit dos `.sql`

`146da9e` (`chore:` a pasta `sql` montada no `db`). Os dois `.sql` ainda **sem commit**.
Verificado no `sql_lab`:

- `contracts.sql`: parcelas 1 e 22 → `64815`, 23 e 27 → `64814`, soma `1750000`. Fecha.
- `violations.sql`, depois do conserto (as linhas `ERROR:` viraram comentário `--`, sem o
  `INTO INTO`, `'Gauss'` com aspas simples, o `installment_count` 0 na coluna certa): **5
  `ERROR`**, um `INSERT 0 1` e `count` `3`. O `1750000.4` entrou como `1750000`, com `id` `7`,
  porque as 4 tentativas que falharam gastaram os `id` de 3 a 6. Fecha.
- `\d contracts`: os três `CHECK`, um com o nome `total_cents_cover_installment_count`.

Menor: os comentários do `violations.sql` dão nomes de constraint no singular
(`contract_total_cents_check`), e o Postgres gera no plural (`contracts_total_cents_check`).

Falta: a prova de estragar (item 6) e o commit `feat:` dos dois `.sql`.

### Revisão 2 — 26/11/2026: fecha

`03661ad` (`feat:` os dois `.sql`). Árvore de código limpa. O `\d contracts` no `sql_lab` lista
os três `CHECK` de novo, e a soma das parcelas do Casarão continua `1750000`.

**Prova de estragar:** sem o `CHECK` do total, o `INSERT` de 5 centavos em 10 parcelas passou,
e as parcelas desse contrato saíram como cinco de 1 centavo e cinco de **0 centavo**. Base `0`,
resto `5`: a regra divide sem erro, e o resultado não tem sentido para uma parcela. É o que o
`CHECK` (e o `ArgumentError` do `Money#split`) impedem. O `CHECK` foi restaurado. Fecha.

> [!note] Quem rodou a prova
> O relato colado é a transcrição de um assistente de código rodando os comandos (leituras,
> edições, `Ran terminal command`). O resultado confere. Fica registrado porque, pelo
> [método](../como-ensinar.md#papéis), a prova é exercício do João: o que ela ensina está em
> ver a regra quebrar com as próprias mãos.
