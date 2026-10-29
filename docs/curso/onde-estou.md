---
tipo: progresso
atualizado: 2026-10-28
modulo_atual: 4
aula_atual: "4.6"
aliases:
  - Onde estou
tags:
  - curso
---

# Onde estou

Nota viva: diz em que ponto da trilha o João está **agora**. É a primeira coisa que o Claude lê
antes de uma aula, e é reescrita ao final de cada sessão — o histórico fica nas aulas, não aqui.

> [!abstract] Agora
> **Módulo 4 — Ruby essencial**. A [aula 4.5 — Bundler e Minitest](modulo-04/04-5-bundler-e-minitest.md)
> fechou em 28/10. Agora, a [aula 4.6 — `Contract` e parcelas](modulo-04/04-6-contract-e-parcelas.md),
> a última do módulo, passada em 28/10: `Installment` com `Data.define`, `Contract` validando na
> criação e `SAMPLE_CONTRACTS`. Desde 10/10 o backend é **Ruby on Rails** (API); ver a
> [mudança de rota](00-plano-de-estudos.md#mudança-de-rota-10102026).

## Estado

Situação em 28/10/2026, último commit `96ddf82`, verificado **no container**:

- `money.rb` (só a classe) + `test/money_test.rb` e `test/money_split_test.rb`:
  `bundle exec rake` → `25 runs, 48 assertions, 0 failures, 0 errors`, tudo commitado;
- `Gemfile` com `rubocop`, `minitest` (6.0.6) e `rake` (13.4.2); `Rakefile` na raiz com
  `default: :test`;
- os relatos do `LoadError` e do `flunk` da 4.5 vieram de outro Ruby (minitest 5.16.3) e foram
  dispensados pelo João;
- `04_money.rb` virou `money.rb` (`0a6516c`); o Copilot só escreve as mensagens de commit;
- `03_split_installments.rb`: 13 linhas, só a calibração em `FAILED`; prova de estragar feita e
  relatada (só os casos que olham a posição protegem a regra do centavo);
- `02_installment_status.rb`: os 8 resultados esperados (quebrado entre `a947069` e `2429a07`);
- RuboCop no projeto desde 23/10, repositório inteiro sem infrações — `Gemfile` na raiz,
  `Dockerfile` com `build-essential`, volume `gems` no `compose.yaml`, Ruby LSP formatando no
  VS Code ([convenção](convencoes.md#ruby-rubocop));
- em 23/10 os arquivos Ruby trocaram `-` por `_` no nome (`a947069`); notas antigas citam o
  nome velho;
- notas do vault de 23 a 26/10 ainda **sem commit**;
- Ruby 4.0.7 também instalado no Windows, mantido de propósito; verificação de aula vale pelo
  container ([convenção](convencoes.md#ruby-roda-no-container)).

Estrutura do `sandbox/`:

| Onde | O quê |
|---|---|
| `modulo-01/money/`, `types/` | `Money` (com `toJSON`/`deJSON`) e os tipos marcados |
| `contrato/contrato.ts` | `Contrato` |
| `contratos/contratos.ts` | os dois contratos de exemplo, usados pelo servidor e pelos testes |
| `test/verificar.ts` | `verificar` e `verificarErro`, compartilhados |
| `modulo-01/05-contrato.ts` | script que imprime os relatórios |
| `modulo-01/test/` | testes de runtime (`04`) e de compilação (`06`) |
| `modulo-03/server.ts` / `index.ts` | servidor `node:http` (cria / liga na 3000) |
| `modulo-03/test/servidor.ts` | teste do servidor (`pnpm test:servidor`) |
| `tsconfig.json` / `tsconfig.build.json` | verificar × emitir |

O sandbox TypeScript está completo: é a **especificação** do port para Ruby no módulo 4 — os
testes de `04-testes.ts` e de `servidor.ts` dizem o que o Ruby precisa fazer.

## Próximos passos

1. Entregar a [aula 4.6](modulo-04/04-6-contract-e-parcelas.md): `installment.rb`, `contract.rb`,
   `sample_contracts.rb`, os testes, a prova de estragar e três perguntas.
2. Depois da 4.6: a revisão oral do módulo 4 e o fechamento do módulo, antes do módulo 5 (Rails
   API e Postgres).
3. Opcional, pendente do módulo 3: repetir um dos estragos da 3.3 com as próprias mãos, e a
   pergunta de aprofundamento `ReferenceError` × `undefined` da
   [revisão oral](modulo-03/README.md#primeira-tentativa--11102026-fecha).

## Pendências abertas

Cada uma aponta para onde nasceu.

- [ ] `listaContratosApi: Contrato[]` tipa como `Contrato` o que vem do `json()` — [aula 3.3](modulo-03/03-3-async-e-teste-do-servidor.md#pendências)
- [ ] `catch` do caso do valor avisa em vez de reprovar — [aula 3.3](modulo-03/03-3-async-e-teste-do-servidor.md#pendências)
- [ ] `exclude` do build lista as pastas de teste uma a uma — [aula 3.3](modulo-03/03-3-async-e-teste-do-servidor.md#pendências)
- [ ] **`Money` pode ser negativo?** `subtrair` lança abaixo de zero. O port para Ruby mantém o
  comportamento; vence no módulo 6, com o `CHECK` da coluna — [aula 2.6](modulo-02/02-6-money-value-object.md)

Do RuboCop (24/10):

- [x] ~~`Gemfile` com 3 `Style/StringLiterals`~~, ~~`TargetRubyVersion: 4.0.7`~~, ~~sobra
  `# gem "rails"`~~ — `f3a3c81`
- [x] ~~`Style/FrozenStringLiteralComment`~~ religado, comentário nos 4 `.rb` (`c6367c9`);
  explicação de *chilled strings* entregue por escrito e pergunta de controle respondida (24/10)
- [x] ~~`175_000_0`~~ → `17_500_00`, agrupado como reais e centavos — escolha válida para
  centavos; o `experimento.rb` usa outro valor (`17_500_000`)
- [ ] Containers órfãos do `docker compose run` (o aviso `Found orphan containers`)

Para **não repetir no port para Ruby** (módulo 4):

- [x] ~~*camelCase* nos nomes Ruby~~ — resolvido na [aula 4.2](modulo-04/04-2-tudo-e-objeto.md)
- [x] ~~`nil` tratado em três lugares no `installment_status`~~ — um lugar só desde `2429a07` (24/10) — [aula 4.2](modulo-04/04-2-tudo-e-objeto.md#pendências)
- [x] ~~`validate_payment!`: `paid &&` que não guardava nada~~ — removido em `41f6b2a` (24/10), verificado no container

- [ ] Getters no estilo Java em `Contrato` — [aula 2.6](modulo-02/02-6-money-value-object.md) — vence na [aula 4.6](modulo-04/04-6-contract-e-parcelas.md)
- [ ] `arrayObjectParcelas` ainda carrega "arrayObject" no nome — [aula 2.2](modulo-02/02-2-revisao-do-modulo-1.md) — vence na [aula 4.6](modulo-04/04-6-contract-e-parcelas.md)
- [ ] `if (parc[0] && parc[5])` pula o teste em silêncio se o array vier curto — [aula 2.4](modulo-02/02-4-higiene-dos-testes.md)

Higiene do sandbox TypeScript — fecha se for barata, ou morre com o sandbox, que vira histórico
quando o backend for para Rails:

- [ ] `noEmit` deveria morar no `tsconfig.json`, não só no script — [módulo 2](modulo-02/README.md#terceira-tentativa--04102026-fecha)
- [ ] `"jsx"` e `"**/*.spec.ts"` sobrando na configuração — [aula 2.7](modulo-02/02-7-build.md)

## O que já domina

O que foi entregue **e** verificado — não o que foi só lido.

- **JavaScript:** variáveis, funções, arrays, objetos, erros, módulos; divisão de parcelas sem
  perder centavo (módulo 1).
- **TypeScript (módulo 2, fechado com revisão oral):** `tsconfig` rigoroso; tipagem estrutural
  e por que o apelido não protege; tipos marcados e construtor inteligente; compilação ×
  runtime; `Money` como value object imutável com `#campo` e fábrica; testes de tipo com
  `@ts-expect-error` e o ritual de conferência; build com dois `tsconfig`, e leitura do
  JavaScript gerado.
- **Node e HTTP (módulo 3, fechado com revisão oral):** processo e porta, event
  loop, `node:http`, roteamento à mão, status code, `405` com `Allow`, serialização com
  `toJSON` e o caminho de volta com `deJSON`; `Promise`, `async`/`await` e `fetch`; separar
  criar × ligar o servidor; teste de integração na porta `0`, com o teste escrito antes do
  conserto.
- **Depuração:** achou o bug do `&&` a partir da saída dos testes e corrigiu a causa.
- **Ferramentas:** Git e Conventional Commits, pnpm, scripts `typecheck`, `build` e `clean`.
- **Ruby (módulo 4, aula 4.1):** Ruby em Docker — imagem × container, tag fixada até a base,
  `compose.yaml` com bind mount, `irb`; fim de linha com `.gitattributes` (`add` × `checkout`);
  divisão inteira, *floor* com negativos, `Integer` sem limite, `Float` IEEE igual ao JS; e,
  depois de duas revisões, a armadilha completa: `Float` não serve para centavo, e a divisão
  inteira perde o resto em silêncio.
- **Ruby (aula 4.2):** tudo é objeto, operador é método, sem conversão implícita; só `false` e
  `nil` são falsos; `nil`, `fetch` × `[]`, `&.`; símbolo × string; `?` e `!`; `def` sem
  `return`, `raise` e `rescue`, guarda com `if` no fim da linha.

## Padrão a vigiar

Três vezes no módulo 2 uma mudança foi feita **copiando** em vez de **mover**, e nas três a
cópia antiga apodreceu. Na 3.3 voltou (o teste carregava uma cópia do servidor) e foi corrigido
na própria aula: o teste passou a importar o `server.ts`, e o `verificar` foi **movido** para
`test/`, não copiado.

Segundo padrão, aparecido no módulo 4: **commit sem rodar a verificação.** Na 4.1 o
`01-divisao.rb` foi commitado com o experimento do `Float`; na 4.2, os dois scripts quebrados
(`NameError` numa renomeação pela metade, e o experimento do `nil` no lugar da entrega), e
depois um "fix" do `NameError` que trouxe outro `NameError`. A
verificação de cada aula é um comando: roda antes do `git commit`, sempre.

No port para Ruby o risco muda de forma: é **traduzir linha a linha** o TypeScript em vez de
escrever Ruby. Getter vira `def get_id`, `for` vira `for`, e o resultado é TypeScript com
sintaxe de Ruby. A pergunta de revisão é sempre: *como alguém que escreve Ruby escreveria
isso?*

## Ver também

- [Plano de estudos](00-plano-de-estudos.md) — o mapa completo e o checklist de módulos
- [Como eu ensino](como-ensinar.md) — o método das aulas
- [Aulas](aulas.base) — todas as aulas com status
