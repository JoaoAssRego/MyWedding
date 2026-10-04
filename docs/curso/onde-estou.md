---
tipo: progresso
atualizado: 2026-10-04
modulo_atual: 3
aula_atual: "3.1"
aliases:
  - Onde estou
tags:
  - curso
---

# Onde estou

Nota viva: diz em que ponto da trilha o João está **agora**. É a primeira coisa que o Claude lê
antes de uma aula, e é reescrita ao final de cada sessão — o histórico fica nas aulas, não aqui.

> [!abstract] Agora
> **Módulo 3 — Node e HTTP sem framework**,
> [aula 3.1 — o primeiro servidor](modulo-03/03-1-primeiro-servidor.md): acaba de ser passada,
> nenhum código ainda. O [módulo 2](modulo-02/README.md) fechou em 04/10/2026, com a revisão
> oral concluída na terceira tentativa.

## Estado

Situação em 04/10/2026, pelo repositório (último commit `02fcf21`), verificado:

- `pnpm typecheck` limpo, enxergando `modulo-01/test/`;
- `pnpm clean && pnpm build` → `dist/` só com o domínio e o script, sem testes;
- `node dist/05-contrato.js` → os dois relatórios, "A soma BATE com o total";
- `node modulo-01/test/04-testes.ts` → 22 linhas, única `FALHOU` é a calibração.

Estrutura do `sandbox/`:

| Onde | O quê |
|---|---|
| `modulo-01/money/`, `contrato/`, `types/` | o domínio |
| `modulo-01/05-contrato.ts` | script que imprime os relatórios |
| `modulo-01/test/` | testes de runtime (`04`) e de compilação (`06`) |
| `modulo-03/` | **ainda não existe** — nasce na aula 3.1 |
| `tsconfig.json` / `tsconfig.build.json` | verificar × emitir |

Atritos já previstos na 3.1, de propósito: `"types": []` vai barrar o `import` de `node:http`
até entrar `@types/node`, e `rootDir: ./modulo-01` vai recusar a pasta nova.

## Próximos passos

1. Aula 3.1 — servidor em `node:http`, `/saude`, `404`, `405`, conferido com `curl -i`.
2. Seguir o [módulo 3](modulo-03/README.md): rotas, serializar `Money`, `POST` com `async`,
   validação, erros como respostas HTTP.

## Pendências abertas

Cada uma aponta para onde nasceu.

- [ ] **`Money` pode ser negativo?** `subtrair` lança abaixo de zero. Vence no módulo 4, com o
  `CHECK` da coluna — [aula 2.6](modulo-02/02-6-money-value-object.md)
- [ ] `noEmit` deveria morar no `tsconfig.json`, não só no script — [módulo 2](modulo-02/README.md#terceira-tentativa--04102026-fecha)
- [ ] `if (parc[0] && parc[5])` pula o teste em silêncio se o array vier curto — [aula 2.4](modulo-02/02-4-higiene-dos-testes.md)
- [ ] `arrayObjectParcelas` ainda carrega "arrayObject" no nome — [aula 2.2](modulo-02/02-2-revisao-do-modulo-1.md)
- [ ] Getters no estilo Java em `Contrato` — [aula 2.6](modulo-02/02-6-money-value-object.md)
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
- **Depuração:** achou o bug do `&&` a partir da saída dos testes e corrigiu a causa.
- **Ferramentas:** Git e Conventional Commits, pnpm, scripts `typecheck`, `build` e `clean`.

## Padrão a vigiar

Três vezes no módulo 2 uma mudança foi feita **copiando** em vez de **mover**, e nas três a
cópia antiga apodreceu. No módulo 3, quando o domínio passar a ser usado pela API, é o momento
em que isso volta a tentar — por exemplo, reescrever a formatação de `Money` dentro do servidor
em vez de usar a que existe.

## Ver também

- [Plano de estudos](00-plano-de-estudos.md) — o mapa completo e o checklist de módulos
- [Como eu ensino](como-ensinar.md) — o método das aulas
- [Aulas](aulas.base) — todas as aulas com status
