---
tipo: aula
modulo: 5
aula: "5.2"
status: em-andamento
conceitos:
  - rails-new
  - compose-multi-servico
  - postgres-no-compose
  - database-url
  - middleware
  - rails-como-app-rack
tags:
  - curso/aula
  - curso/modulo-05
---

# Aula 5.2 — `rails new --api`: a aplicação Rails no container, com Postgres

**Status:** em andamento — tarefa passada em 06/11/2026.

## Contexto

A [5.1](05-1-rack.md) terminou com um app Rack de 90 linhas: um objeto com `call(env)`, um
`config.ru` com `run ContractsApi.new`, e o Puma na porta. Esta aula gera a aplicação Rails de
verdade em `apps/api/` e mostra que ela é a mesma coisa, só que maior: o `config.ru` gerado
termina em `run Rails.application`.

O roteiro foi testado no container em 06/11/2026, numa cópia descartável: Rails **8.1.4.1**,
Puma 8.0.2 e Postgres **18.6**. O teste mostrou quatro coisas que entram na tarefa:

1. o `rails new` chama o `git`, e o container não tem: `No such file or directory - git`;
2. a gem `pg` compila contra a biblioteca do Postgres, então o container precisa de `libpq-dev`;
3. **sem banco, até o `/up` dá `500`.** Em desenvolvimento, o Rails confere a cada requisição
   se há *migration* pendente (`ActiveRecord::Migration::CheckPending`), e isso abre conexão.
   Sem Postgres, a resposta é `ActiveRecord::ConnectionNotEstablished`. Por isso o Postgres
   entra no Compose já nesta aula, e não na 5.4;
4. o `rails new` faz `git init` dentro da pasta, e isso cria um **repositório dentro do
   repositório**.

## Teoria

### Gerar sem instalar o Rails na máquina

O comando `rails new` é da gem `rails`, mas a [convenção](../convencoes.md#ruby-bundler-e-bundle-exec)
proíbe `gem install` para ferramenta de projeto. A saída é a mesma do Bundler:

1. um `Gemfile` provisório em `apps/api/` com uma linha só, `gem 'rails', '~> 8.1'`;
2. `bundle install` nessa pasta;
3. `bundle exec rails new . --force …`, que gera a aplicação **por cima** do `Gemfile`
   provisório (`--force`) e roda o `bundle install` de novo, agora com o `Gemfile` completo.

O `.` é "nesta pasta". O `--name=my_wedding` dá nome à aplicação, `MyWedding::Application`.
Sem ele, o nome viria da pasta, e a classe seria `Api::Application`, que colide com o
`module Api` que costuma agrupar *controllers* de API.

### As opções: o que fica de fora, e por quê

```text
--api --database=postgresql --name=my_wedding
--skip-docker --skip-kamal --skip-thruster --skip-ci
--skip-solid --skip-action-mailer --skip-action-mailbox --skip-action-text
--skip-action-cable --skip-active-storage --skip-jbuilder
```

- `--api`: sem *views*, sem *assets*, sem sessão por *cookie* no padrão. É o que o
  [ADR 0001](../../adr/0001-use-rails-for-the-api.md) decidiu.
- `--database=postgresql`: o `Gemfile` ganha a gem `pg`, e o `config/database.yml` aponta para
  o Postgres.
- `--skip-docker`, `--skip-kamal`, `--skip-thruster`: o gerador traria um `Dockerfile` de
  produção e ferramentas de deploy. O deploy é o módulo 10. Gerar agora seriam dois
  `Dockerfile` no repositório, e um deles parado.
- `--skip-ci`: o gerador escreveria `apps/api/.github/`, que o GitHub ignora, porque só lê o
  `.github/` da raiz. A CI também é o módulo 10.
- o resto (*mailer*, *mailbox*, *text*, *cable*, *storage*, *solid*, *jbuilder*): peças que o
  projeto não usa agora. Cada uma pode voltar quando aparecer a necessidade. Os anexos do
  roadmap, por exemplo, devem trazer o *Active Storage* de volta.

Ficam o RuboCop (com o estilo `rubocop-rails-omakase`), o Brakeman e o `bundler-audit`.

### Dois serviços no Compose

```yaml
services:
  db:
    image: postgres:18.6
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - pgdata:/var/lib/postgresql

  api:
    build: .
    working_dir: /MyWedding/apps/api
    command: bin/rails server -b 0.0.0.0
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://postgres:postgres@db:5432
    depends_on:
      - db
    volumes:
      - .:/MyWedding
      - gems:/usr/local/bundle
```

Este é o desenho, não o arquivo pronto: o seu `compose.yaml` já tem o serviço `ruby` e o volume
`gems`, e eles continuam.

- **`db` é o nome do host.** Dentro da rede que o Compose cria, o container `api` encontra o
  Postgres pelo nome do serviço. O `localhost` do container `api` é ele mesmo (a mesma lição
  do `0.0.0.0` da 5.1, do outro lado).
- **`DATABASE_URL` sem nome de banco.** O Rails junta a URL com o `config/database.yml`. A URL
  dá o host, o usuário e a senha, e o `.yml` dá o nome (`my_wedding_development`,
  `my_wedding_test`). Uma variável só serve aos dois ambientes.
- **`pgdata`** guarda os dados do Postgres entre um `up` e outro, como o `gems` guarda as gems.
- **`depends_on`** liga o `db` antes do `api`, mas não espera o Postgres terminar de subir. Se
  a primeira requisição chegar cedo demais, pode falhar. O `healthcheck` resolve isso, e entra
  quando for preciso.
- A senha `postgres` escrita no arquivo serve só para o desenvolvimento local. Segredo de
  produção não entra no repositório (módulo 10).

### O Rails é um app Rack

```text
$ bin/rails runner 'p Rails.application.respond_to?(:call)'
true
```

E o `config.ru` gerado:

```ruby
require_relative "config/environment"

run Rails.application
```

O `bin/rails middleware` lista as camadas que embrulham a aplicação antes da sua rota: 19 numa
aplicação `--api` recém-gerada. Algumas para reconhecer:

| Camada | O que faz | Na 5.1 |
|---|---|---|
| `ActionDispatch::HostAuthorization` | recusa requisição para *host* desconhecido (`403`) | não existia |
| `ActionDispatch::ShowExceptions`, `DebugExceptions` | transformam exceção em página de erro | o `Rack::ShowExceptions` do `rackup` |
| `ActiveRecord::Migration::CheckPending` | confere *migration* pendente a cada requisição em desenvolvimento | não existia; é o `500` sem banco |
| `Rack::Head`, `Rack::ETag` | `HEAD` sem corpo, cache por *ETag* | não existia |

O `run MyWedding::Application.routes`, no fim da lista, é o seu `dispatch(path)` da 5.1.

## Tarefa

1. **`Dockerfile`:** acrescente `git`, `libpq-dev` e `libyaml-dev` ao `apt-get install`. Depois,
   `docker compose build`.

2. **`compose.yaml`:** os serviços `db` e `api` e o volume `pgdata`, pelo desenho da teoria. O
   serviço `ruby` continua como está.

3. **Gerar a aplicação**, pelo serviço `ruby` com `-w /MyWedding/apps/api`:
   - apague o `apps/api/.gitkeep`;
   - escreva o `Gemfile` provisório e rode o `bundle install`;
   - rode o `bundle exec rails new . --force` com as opções da teoria.

4. **Arrumar o que o gerador deixou:**
   - **apague `apps/api/.git`.** Rode `git status` na raiz antes e depois, e veja a diferença
     no jeito como o Git mostra `apps/api/`;
   - confira que `apps/api/config/master.key` **não** aparece no `git status`. O `.gitignore`
     gerado em `apps/api/` cuida disso, e esse arquivo nunca vai para o Git.

5. **RuboCop da raiz:** o `bundle exec rubocop` da raiz quebra com
   `Unable to find gem rubocop-rails-omakase`, porque desce até `apps/api/` e tenta usar a
   configuração de lá. No `.rubocop.yml` da raiz, exclua `apps/**/*` do `AllCops` com
   `inherit_mode: { merge: [Exclude] }`, para não perder as exclusões padrão. A aplicação Rails
   tem o próprio RuboCop: `docker compose run --rm api bin/rubocop`.

6. **No ar:** `docker compose run --rm api bin/rails db:create` e depois `docker compose up
   api`. Do Windows, com `curl.exe -i`:
   - `/up` → `200`;
   - `/contracts` → `404`, com `content-type: application/json` (ainda não existe rota).

7. **Prova de estragar:** com a `api` no ar, `docker compose stop db` e `curl.exe -i
   http://localhost:3000/up`. Qual o status? Ligue o `db` de novo.

8. **Commits**, com tudo verde antes:
   - `chore:` para `Dockerfile`, `compose.yaml` e `.rubocop.yml`;
   - `feat:` para a aplicação gerada. Diga no corpo do commit que é a saída do `rails new` e
     com quais opções.

## Verificação

```bash
docker compose run --rm api bin/rails test
```

`0 runs, 0 assertions, 0 failures, 0 errors`: a suíte vazia, mas carregando e falando com o
`my_wedding_test`.

```bash
docker compose run --rm api bin/rubocop
```

`no offenses detected`.

```bash
docker compose run --rm ruby sh -c 'bundle exec rake && bundle exec rubocop'
```

A raiz continua verde: os 52 testes do sandbox e o RuboCop limpo.

```text
$ curl.exe -i http://localhost:3000/up
HTTP/1.1 200 OK
```

## Para a revisão oral do módulo

Ficam no [README do módulo](README.md#revisão-oral-de-fechamento): por que o `/up` dá `500` sem
banco; por que o `api` acha o Postgres em `db` e não em `localhost`; e onde, na lista do
`bin/rails middleware`, está o equivalente da sua `ContractsApi`.
