---
tipo: modulo
modulo: 5
status: em-andamento
tags:
  - curso/modulo
  - curso/modulo-05
---

# Módulo 5 — Rails API e Postgres

**Entregável:** a API do [módulo 3](../modulo-03/README.md) reescrita em Rails e persistida no
Postgres, com os mesmos casos de teste da [aula 3.3](../modulo-03/03-3-async-e-teste-do-servidor.md).
**Onde vive o código:** `sandbox/modulo-05/` na aula 5.1 e, a partir da 5.2, `apps/api/`, a
aplicação Rails de verdade.
**Status:** em andamento — [aula 5.1](05-1-rack.md) passada em 31/10/2026.

## Por que começar pelo Rack

O módulo 3 fez à mão o que um framework faz: abrir a porta, ler a URL, escolher a função,
transformar objeto em JSON, devolver o status. O [README do módulo 3](../modulo-03/README.md#por-que-sem-framework)
prometeu a ponte: **por baixo do Rails existe o Rack**, e uma aplicação Rack é um objeto que
recebe a requisição e devolve status, cabeçalhos e corpo, o mesmo formato do handler do
`createServer`.

A 5.1 escreve a API do módulo 3 em Rack puro, sem Rails. A 5.2 gera a aplicação Rails e mostra
que ela também é só um objeto Rack, muito maior. A partir daí, cada peça do Rails é comparada
com o que o módulo 3 fez à mão.

| Já fez no módulo 3 (`node:http`) | Vai ver no Rails |
|---|---|
| `createServer((req, res) => …)` | um app Rack: `call(env)` → `[status, headers, body]` |
| `url.pathname.split("/")` e `if` por rota | `config/routes.rb` |
| a função que trata a rota | uma *action* de *controller* |
| `JSON.stringify` + `toJSON` | `render json:` |
| `405` com `Allow` montado à mão | o roteador responde sozinho; saber **o que** ele responde |
| `contratos` num array em memória | uma tabela no Postgres, lida pelo ActiveRecord |
| `servidor.listen(0)` + `fetch` no teste | teste de integração do Rails |

## Aulas

Cada arquivo nasce quando a aula é passada. A lista é o plano e pode mudar com o que as aulas
mostrarem.

| # | Aula | Status |
|---|---|---|
| 5.1 | [Rack: a API do módulo 3 sem framework, em Ruby](05-1-rack.md) | em andamento |
| 5.2 | `rails new --api` no container: o que o gerador cria, e o Rails como app Rack | prevista |
| 5.3 | Rotas, controllers e JSON: `/health` e `/contracts` com o domínio do módulo 4 | prevista |
| 5.4 | Postgres no Compose e SQL à mão: a tabela `contracts` com `BIGINT` e `CHECK` | prevista |
| 5.5 | Migration × SQL e ActiveRecord básico: a mesma tabela, gerada e lida | prevista |
| 5.6 | `POST`: corpo, *strong parameters*, validação e erros como resposta HTTP (`201`, `422`) | prevista |
| 5.7 | Teste de integração contra o Postgres: os casos da 3.3 em Rails | prevista |

As três peças que o módulo 3 cortou (corpo de `POST`, validação, erros como resposta HTTP)
voltam na 5.6.

## Ambiente

Tudo continua no container ([convenção](../convencoes.md#ruby-roda-no-container)). Duas coisas
novas aparecem neste módulo:

- **Porta publicada.** Um servidor dentro do container só é alcançável do Windows se a porta
  for publicada (`-p 9292:9292` no `docker compose run`, ou `ports:` no `compose.yaml`) **e** se
  o servidor escutar em `0.0.0.0`, não em `localhost`. O `localhost` de dentro do container não
  é o do Windows.
- **Um segundo serviço.** Na 5.4 o `compose.yaml` ganha o Postgres, e o container do Ruby passa
  a falar com ele pelo nome do serviço, não por `localhost`.

## Pendências herdadas

- **`Money` pode ser negativo?** Vence no módulo 6, com o `CHECK` da coluna. A 5.4 cria a
  primeira coluna de centavos e é o lugar de ver o `CHECK` pela primeira vez.
- Do módulo 3 ([aula 3.3](../modulo-03/03-3-async-e-teste-do-servidor.md#pendências)):
  `Contrato[]` tipando o que vem do `json()` e o `catch` que avisa em vez de reprovar. As duas
  morrem com o sandbox TypeScript; o equivalente em Ruby é o teste de integração da 5.7, que
  reprova de verdade.
