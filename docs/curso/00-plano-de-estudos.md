---
tipo: mapa
aliases:
  - Plano de estudos
  - Início
tags:
  - curso
---

# Plano de estudos — MyWedding

> [!tip] Por onde começar
> - [Onde estou](onde-estou.md) — o ponto atual da trilha, próximos passos e pendências
> - [Como as aulas são dadas](como-ensinar.md) — o método
> - [Aulas](aulas.base) — todas as aulas com status
> - [Convenções](convencoes.md) · [Como registrar as aulas](como-registrar-as-aulas.md)

Este arquivo é o mapa do curso. O plano técnico (arquitetura, modelo de dados, decisões) vive
separado; aqui só interessa **a ordem em que você aprende as coisas** e o que você entrega em
cada etapa.

## Como funciona

Cada aula tem três partes: um pouco de teoria (curta), uma **tarefa** que você escreve, e uma
**verificação** que diz se ficou certo. Eu não escrevo o código do projeto — explico, passo a
tarefa, reviso o que você fez e aponto o que melhorar. Quando você errar, o erro é material de
aula, não problema.

Cada aula vira um arquivo próprio em `docs/curso/`; o formato está em
[como-registrar-as-aulas.md](como-registrar-as-aulas.md), e as regras que valem para o projeto
inteiro em [convencoes.md](convencoes.md).

Regra de ouro: **não avance de módulo sem ter feito as tarefas do anterior.** Ler sobre
programação dá a sensação de aprender; só escrever ensina de verdade.

## Ponto de partida (07/09/2026)

Já tem: SQL básico, Git e terminal no dia a dia. Ambiente com Node 24, npm, Git, Docker e
VS Code instalados.

Vai aprender do zero: JavaScript, TypeScript, Node/HTTP, **Ruby e Rails**, React, e a parte de
modelagem e operação (Postgres, migrations, RLS, testes, CI, deploy).

## Mudança de rota (10/10/2026)

> [!important] O backend passou de NestJS para Ruby on Rails
> O João vai entrar num projeto voluntário em Rails (API + frontend separado) e nunca estudou
> Ruby. Em vez de aprender Rails à parte, o MyWedding passa a ser o lugar onde ele aprende Rails
> aplicando em algo real. A trilha **não recomeçou**: os módulos 0–3 ficam como estão e valem
> como base. A decisão técnica está no [ADR 0001](../adr/0001-use-rails-for-the-api.md).
>
> - **Saíram:** NestJS (antigo módulo 5), Prisma (antigo 6), Zod compartilhado entre API e web,
>   e o módulo de Postgres isolado (antigo 4) — o SQL à mão virou aula dentro dos módulos 5 e 6.
> - **Entraram:** Ruby essencial (4), Rails API e Postgres (5), modelagem no ActiveRecord (6).
>   Autenticação e multi-tenant viraram um módulo só (7).
> - **Encurtado:** o módulo 3 fecha na aula 3.3. Ler corpo de `POST`, validação e erros como
>   resposta HTTP — que estavam previstos — são ensinados em Rails, no módulo 5.
> - **Ficaram:** React (8), relatórios (9), testes/CI/deploy (10). O frontend continua React,
>   que é o formato do projeto voluntário.
>
> Ruby roda em **Docker**: não há Ruby instalado no Windows, e o container é o mesmo ambiente
> que a CI e o deploy vão usar.

## Módulos

| # | Módulo | O que você sai sabendo | Entregável |
|---|---|---|---|
| 0 | Preparação | pnpm, estrutura de pastas, Conventional Commits | Repo inicializado, primeiro commit padronizado |
| 1 | JavaScript essencial | variáveis, tipos, função, array, objeto, erro, módulos | `Money` funcionando em JS puro: soma, divisão de parcelas sem perder centavo |
| 2 | TypeScript | tipos, interface, união, genérico, `strict`, build | O mesmo `Money`, agora tipado e impossível de usar errado |
| 3 | Node e HTTP sem framework | processo, módulo, `http`, JSON, rota, status code, async | Uma API minúscula de contratos, sem framework nenhum, testada por um programa |
| 4 | Ruby essencial | Docker como ambiente, objeto, símbolo, bloco, `Enumerable`, classe, módulo, `Comparable`, Bundler, Minitest | `Money` e `Contract` portados para Ruby, com testes, rodando no container |
| 5 | Rails API e Postgres | Rack, `rails new --api`, rota, controller, JSON, status, Postgres, SQL à mão × migration, ActiveRecord básico, teste de integração | A API do módulo 3 reescrita em Rails e persistida no Postgres, com os mesmos casos de teste da 3.3 |
| 6 | Modelagem financeira no ActiveRecord | associação, constraint no banco × validação, transação, índice, CTE, tipo de atributo próprio para `Money` | Fornecedor → contrato → parcela → pagamento, com alocação muitos-para-muitos e status derivado |
| 7 | Autenticação e multi-tenant | `has_secure_password`, sessão/token para API, cookie httpOnly, isolamento por `wedding_id`, RLS | Login e convite funcionando; nenhum tenant lê o dado de outro — provado por teste |
| 8 | React e Vite | componente, props, estado, hook, roteamento, TanStack Query, formulário | Telas de fornecedores, contratos e pagamentos consumindo a API Rails |
| 9 | Relatórios e dashboard | SQL analítico, agregação, projeção de caixa, gráfico | Painel Orçado × Contratado × Pago + projeção até a data do casamento |
| 10 | Testes, CI e deploy | Minitest, E2E, GitHub Actions, container, deploy | v1 no ar, CI verde, README e ADRs |

Depois da v1, na ordem já combinada: alertas de vencimento, CDI real da API do Banco Central,
log de auditoria, conciliação de extrato bancário e, por último, a parte pública para convidados.

## Expectativa de tempo (seja realista)

Com **5 a 10 horas por semana**, partindo de zero em JavaScript, a v1 completa fica em torno de
**6 a 7 meses**. Como o casamento é daqui a mais de 12 meses, cabe — e sobra tempo para as fases
avançadas. O que não cabe é tentar atalhar os módulos 1 e 2: quem pula fundamento passa os
outros oito módulos copiando código sem entender, e é exatamente isso que a gente está evitando.

A troca para Rails acrescenta uma linguagem nova, mas tira duas ferramentas (NestJS e Prisma) e
um módulo inteiro. Conta realista: **um a dois meses a mais** que o previsto. O módulo 4 é o que
mais rende atalho perigoso — o Rails esconde tanta coisa que dá para fazer telas funcionarem
sem saber Ruby. É exatamente por isso que ele vem antes.

Sinal de que você está no ritmo certo: ao final de cada módulo, você consegue **explicar em voz
alta** o que escreveu, sem olhar o código.

## Progresso

- [x] Módulo 0 — Preparação
- [x] Módulo 1 — JavaScript essencial
- [x] [Módulo 2 — TypeScript](modulo-02/README.md)
- [ ] [Módulo 3 — Node e HTTP sem framework](modulo-03/README.md)
- [ ] [Módulo 4 — Ruby essencial](modulo-04/README.md)
- [ ] Módulo 5 — Rails API e Postgres
- [ ] Módulo 6 — Modelagem financeira no ActiveRecord
- [ ] Módulo 7 — Autenticação e multi-tenant
- [ ] Módulo 8 — React e Vite
- [ ] Módulo 9 — Relatórios e dashboard
- [ ] Módulo 10 — Testes, CI e deploy
