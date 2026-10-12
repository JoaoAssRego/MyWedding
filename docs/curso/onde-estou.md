---
tipo: progresso
atualizado: 2026-10-12
modulo_atual: 4
aula_atual: "4.1"
aliases:
  - Onde estou
tags:
  - curso
---

# Onde estou

Nota viva: diz em que ponto da trilha o João está **agora**. É a primeira coisa que o Claude lê
antes de uma aula, e é reescrita ao final de cada sessão — o histórico fica nas aulas, não aqui.

> [!abstract] Agora
> **Módulo 3 fechado** em 11/10, com a [revisão oral](modulo-03/README.md#revisão-oral-de-fechamento)
> na primeira tentativa. Próximo: [módulo 4 — Ruby essencial](modulo-04/README.md), começando
> pela aula 4.1 (Ruby em Docker), ainda não passada. Desde 10/10 o backend é **Ruby on Rails**
> (API) — ver a [mudança de rota](00-plano-de-estudos.md#mudança-de-rota-10102026).

## Estado

Situação em 12/10/2026 (último commit `df61375`, árvore limpa, sincronizado com o GitHub),
verificado:

- `pnpm test:servidor` → onze casos `OK`; `pnpm typecheck` limpo; `pnpm build` sem testes no
  `dist/`; os 21 casos do domínio `OK`;
- Ruby **não** está instalado no Windows; Docker 29.8 está. Ainda não existe `compose.yaml`.

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

1. Passar a aula 4.1 — Ruby em Docker: imagem oficial com tag exata, `compose.yaml` na raiz,
   `docker compose run --rm`, `irb`. Atritos previstos no [README do módulo 4](modulo-04/README.md#ambiente-ruby-em-docker).
2. Opcional, antes: repetir um dos estragos da 3.3 com as próprias mãos, e responder a pergunta
   de aprofundamento da [revisão oral](modulo-03/README.md#primeira-tentativa--11102026-fecha)
   (`ReferenceError` × `undefined`).

## Pendências abertas

Cada uma aponta para onde nasceu.

- [ ] `listaContratosApi: Contrato[]` tipa como `Contrato` o que vem do `json()` — [aula 3.3](modulo-03/03-3-async-e-teste-do-servidor.md#pendências)
- [ ] `catch` do caso do valor avisa em vez de reprovar — [aula 3.3](modulo-03/03-3-async-e-teste-do-servidor.md#pendências)
- [ ] `exclude` do build lista as pastas de teste uma a uma — [aula 3.3](modulo-03/03-3-async-e-teste-do-servidor.md#pendências)
- [ ] **`Money` pode ser negativo?** `subtrair` lança abaixo de zero. O port para Ruby mantém o
  comportamento; vence no módulo 6, com o `CHECK` da coluna — [aula 2.6](modulo-02/02-6-money-value-object.md)

Para **não repetir no port para Ruby** (módulo 4):

- [ ] Getters no estilo Java em `Contrato` — [aula 2.6](modulo-02/02-6-money-value-object.md)
- [ ] `arrayObjectParcelas` ainda carrega "arrayObject" no nome — [aula 2.2](modulo-02/02-2-revisao-do-modulo-1.md)
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
- **Ruby e Rails:** nada ainda — começa do zero no módulo 4.

## Padrão a vigiar

Três vezes no módulo 2 uma mudança foi feita **copiando** em vez de **mover**, e nas três a
cópia antiga apodreceu. Na 3.3 voltou (o teste carregava uma cópia do servidor) e foi corrigido
na própria aula: o teste passou a importar o `server.ts`, e o `verificar` foi **movido** para
`test/`, não copiado.

No port para Ruby o risco muda de forma: é **traduzir linha a linha** o TypeScript em vez de
escrever Ruby. Getter vira `def get_id`, `for` vira `for`, e o resultado é TypeScript com
sintaxe de Ruby. A pergunta de revisão é sempre: *como alguém que escreve Ruby escreveria
isso?*

## Ver também

- [Plano de estudos](00-plano-de-estudos.md) — o mapa completo e o checklist de módulos
- [Como eu ensino](como-ensinar.md) — o método das aulas
- [Aulas](aulas.base) — todas as aulas com status
