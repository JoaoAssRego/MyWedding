---
tipo: progresso
atualizado: 2026-10-04
modulo_atual: 2
aula_atual: "2.7"
aliases:
  - Onde estou
tags:
  - curso
---

# Onde estou

Nota viva: diz em que ponto da trilha o João está **agora**. É a primeira coisa que o Claude lê
antes de uma aula, e é reescrita ao final de cada sessão — o histórico fica nas aulas, não aqui.

> [!abstract] Agora
> **Módulo 2 — TypeScript**. A [aula 2.6 — `Money` value object](modulo-02/02-6-money-value-object.md)
> fechou; a [aula 2.7 — o build](modulo-02/02-7-build.md) está quase lá: `dist/` sai, roda e
> bate com a versão `.ts`. Falta separar o build dos testes com um `tsconfig.build.json`.

## Estado

Situação em 04/10/2026, verificado:

- `pnpm typecheck` limpo e `pnpm build` gerando `dist/` (com `rewriteRelativeImportExtensions`,
  os imports do JS gerado apontam para `.js`);
- `node dist/05-contrato.js` e `node dist/04-testes.js` imprimem o mesmo que os `.ts`;
- `node modulo-01/04-testes.ts` → 22 linhas, única `FALHOU` é a calibração;
- `node modulo-01/05-contrato.ts` → os dois relatórios, "A soma BATE com o total";
- os quatro `@ts-expect-error` de `06-testes-de-tipos.ts` provam, cada um, o erro que o
  comentário promete (conferido com as diretivas comentadas).

`Money` e `Contrato` são classes com campos `#`; o domínio devolve dados e quem imprime é o
script `05-contrato.ts`.

O módulo passou a ter **dois tipos de teste, com dois comandos**:

| Arquivo | Como roda | O que prova |
|---|---|---|
| `04-testes.ts` | `node modulo-01/04-testes.ts` | o que o programa faz com valores válidos e inválidos |
| `06-testes-de-tipos.ts` | `pnpm typecheck` | o que o programa **não deixa nem escrever** |

## Próximos passos

1. Fechar a aula 2.7: `tsconfig.build.json` separando verificação de emissão.
2. Fechar o [módulo 2](modulo-02/README.md) e marcar no [plano](00-plano-de-estudos.md#progresso).
3. Módulo 3 — Node e HTTP sem framework.

## Pendências abertas

Cada uma aponta para onde nasceu. As da aula 2.6 em curso estão na própria nota da aula.

- [x] Construtores em camelCase, `Contrato.quantidadeParcelas` e mensagem de `centavos` — feitos na largada da [aula 2.6](modulo-02/02-6-money-value-object.md)
- [x] R$ 0,00 **é** valor monetário válido (`Money.deCentavos(0)` é o neutro do `reduce`); contrato sem valor continua recusado — [aula 2.2](modulo-02/02-2-revisao-do-modulo-1.md)
- [ ] `if (parc[0] && parc[5])` pula o teste em silêncio se o array vier curto — [aula 2.4](modulo-02/02-4-higiene-dos-testes.md)
- [ ] `arrayObjectParcelas` ainda carrega "arrayObject" no nome — [aula 2.2](modulo-02/02-2-revisao-do-modulo-1.md)

## O que já domina

O que foi entregue **e** verificado — não o que foi só lido.

- **JavaScript:** variáveis, funções, arrays, objetos, erros, módulos; divisão de parcelas sem
  perder centavo (módulo 1).
- **TypeScript:** anotação de tipos, `interface`, `import type`, `tsconfig` rigoroso
  (`strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`, `exactOptionalPropertyTypes`).
- **Tipagem estrutural e tipos marcados:** entendeu por que o apelido não protege, escreveu
  marca e construtor a partir de um exemplo em outro domínio, e acertou o que **não** marcar.
- **Compilação × runtime:** sabe dizer qual erro cada uma pega, e separou os testes em dois
  arquivos por causa disso. Respondeu sozinho por que a guarda `numero > total` sobrevive —
  invariante relacional.
- **Depuração:** achou o bug do `&&` a partir da saída dos testes e corrigiu a causa.
- **Ferramentas:** Git e Conventional Commits no dia a dia, pnpm, script de `typecheck`.

## Ver também

- [Plano de estudos](00-plano-de-estudos.md) — o mapa completo e o checklist de módulos
- [Como eu ensino](como-ensinar.md) — o método das aulas
- [Aulas](aulas.base) — todas as aulas com status
