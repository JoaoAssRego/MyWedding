# Módulo 2 — TypeScript

**Entregável:** o mesmo `Money` do módulo 1, agora tipado e impossível de usar errado.
**Onde vive o código:** `sandbox/modulo-01/` (nasce no sandbox e migra para `apps/api` no
módulo 5).
**Status:** em andamento.

## Aulas

| # | Aula | Status |
|---|---|---|
| 2.1 | [Migração para `.ts` e tipos próprios](02-1-migracao-para-ts.md) | concluída |
| 2.2 | [Revisão do código do módulo 1](02-2-revisao-do-modulo-1.md) | concluída |
| 2.3 | [Fazer o módulo 1 passar pelo compilador](02-3-tipos-no-modulo-1.md) | concluída |
| 2.4 | [Higiene dos testes e nomes honestos](02-4-higiene-dos-testes.md) | concluída |
| 2.5 | [Tipos marcados: um número que sabe o que é](02-5-branded-types.md) | em andamento |

Depois da 2.5, falta para fechar o módulo: o `Money` como value object imutável e o build
(`tsc` gerando saída de verdade, não só `--noEmit`).

## Configuração do TypeScript

`sandbox/tsconfig.json` está em modo rigoroso de propósito:

| Flag | O que faz |
|---|---|
| `strict` | liga o conjunto de checagens rigorosas, incluindo `strictNullChecks` |
| `noUncheckedIndexedAccess` | acesso por índice devolve `T \| undefined`, porque o índice pode não existir |
| `exactOptionalPropertyTypes` | `prop?: number` não aceita `undefined` explícito — ausente e "presente valendo undefined" são coisas diferentes |
| `verbatimModuleSyntax` | import de tipo tem que ser `import type`; o que sobra no JS é exatamente o que está escrito |
| `allowImportingTsExtensions` + `noEmit` | permite `import "./money.ts"`; o Node 24 executa `.ts` direto e o `tsc` só verifica |

## Pendências do módulo

- A guarda `numeroParcelas > totalCentavos` rejeita um contrato de R$ 0,00. É intencional
  (contrato sem valor não existe) ou efeito colateral da regra "cada parcela precisa de pelo
  menos 1 centavo"? Decidir antes de fechar o módulo. — aberta na [aula 2.2](02-2-revisao-do-modulo-1.md)
- `dividirEmParcelas(390000, 20)` e `dividirEmParcelas(20, 390000)` têm a mesma assinatura, e
  nada impede passar reais onde se espera centavos. É o coração do entregável e ainda não foi
  atacado.
