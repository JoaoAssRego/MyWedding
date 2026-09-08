# Plano de estudos — MyWedding

Este arquivo é o mapa do curso. O plano técnico (arquitetura, modelo de dados, decisões) vive
separado; aqui só interessa **a ordem em que você aprende as coisas** e o que você entrega em
cada etapa.

## Como funciona

Cada aula tem três partes: um pouco de teoria (curta), uma **tarefa** que você escreve, e uma
**verificação** que diz se ficou certo. Eu não escrevo o código do projeto — explico, passo a
tarefa, reviso o que você fez e aponto o que melhorar. Quando você errar, o erro é material de
aula, não problema.

Regra de ouro: **não avance de módulo sem ter feito as tarefas do anterior.** Ler sobre
programação dá a sensação de aprender; só escrever ensina de verdade.

## Ponto de partida (07/09/2026)

Já tem: SQL básico, Git e terminal no dia a dia. Ambiente com Node 24, npm, Git, Docker e
VS Code instalados.

Vai aprender do zero: JavaScript, TypeScript, Node/HTTP, React, e a parte de modelagem e
operação (Prisma, migrations, RLS, testes, CI, deploy).

## Módulos

| # | Módulo | O que você sai sabendo | Entregável |
|---|---|---|---|
| 0 | Preparação | pnpm, estrutura de pastas, Conventional Commits | Repo inicializado, primeiro commit padronizado |
| 1 | JavaScript essencial | variáveis, tipos, função, array, objeto, erro, módulos | `Money` funcionando em JS puro: soma, divisão de parcelas sem perder centavo |
| 2 | TypeScript | tipos, interface, união, genérico, `strict`, build | O mesmo `Money`, agora tipado e impossível de usar errado |
| 3 | Node e HTTP sem framework | processo, módulo, `http`, JSON, rota, status code, async | Uma API minúscula de contratos, sem framework nenhum |
| 4 | Postgres e modelagem | tabela, chave, constraint, transação, índice, CTE | Schema do casamento desenhado e criado à mão em SQL |
| 5 | Monorepo e NestJS | pnpm workspaces, módulo, controller, service, DI, DTO | A API do módulo 3 reescrita em NestJS, e você entendendo o porquê de cada camada |
| 6 | Prisma, migrations e multi-tenant | schema, migration, RLS, isolamento por `wedding_id` | Nenhum tenant consegue ler o dado de outro — provado por teste |
| 7 | Autenticação | hash de senha, JWT, refresh rotativo, cookie httpOnly | Login e convite de membro funcionando |
| 8 | React e Vite | componente, props, estado, hook, roteamento, TanStack Query, formulário | Telas de fornecedores, contratos e pagamentos |
| 9 | Relatórios e dashboard | SQL analítico, agregação, projeção de caixa, gráfico | Painel Orçado × Contratado × Pago + projeção até a data do casamento |
| 10 | Testes, CI e deploy | teste unitário, integração com Testcontainers, E2E, GitHub Actions, container | v1 no ar, CI verde, README e ADRs |

Depois da v1, na ordem já combinada: alertas de vencimento, CDI real da API do Banco Central,
log de auditoria, conciliação de extrato bancário e, por último, a parte pública para convidados.

## Expectativa de tempo (seja realista)

Com **5 a 10 horas por semana**, partindo de zero em JavaScript, a v1 completa fica em torno de
**6 a 7 meses**. Como o casamento é daqui a mais de 12 meses, cabe — e sobra tempo para as fases
avançadas. O que não cabe é tentar atalhar os módulos 1 e 2: quem pula fundamento passa os
outros oito módulos copiando código sem entender, e é exatamente isso que a gente está evitando.

Sinal de que você está no ritmo certo: ao final de cada módulo, você consegue **explicar em voz
alta** o que escreveu, sem olhar o código.

## Progresso

- [ ] Módulo 0 — Preparação
- [ ] Módulo 1 — JavaScript essencial
- [ ] Módulo 2 — TypeScript
- [ ] Módulo 3 — Node e HTTP sem framework
- [ ] Módulo 4 — Postgres e modelagem
- [ ] Módulo 5 — Monorepo e NestJS
- [ ] Módulo 6 — Prisma, migrations e multi-tenant
- [ ] Módulo 7 — Autenticação
- [ ] Módulo 8 — React e Vite
- [ ] Módulo 9 — Relatórios e dashboard
- [ ] Módulo 10 — Testes, CI e deploy
