---
tipo: progresso
atualizado: 2026-09-29
modulo_atual: 2
aula_atual: "2.6"
aliases:
  - Onde estou
tags:
  - curso
---

# Onde estou

Nota viva: diz em que ponto da trilha o João está **agora**. É a primeira coisa que o Claude lê
antes de uma aula, e é reescrita ao final de cada sessão — o histórico fica nas aulas, não aqui.

> [!abstract] Agora
> **Módulo 2 — TypeScript**, [aula 2.6 — `Money` value object](modulo-02/02-6-money-value-object.md):
> o `money.ts` antigo morreu e os testes foram corrigidos; faltam **dois erros de compilação**
> e tirar `gerarParcelas` de dentro de um script.

## Estado

Situação em 29/09/2026, pelo repositório (último commit `8d43eb0` + alterações não commitadas):

- `tsc --noEmit` → **2 erros** (eram 7): um `this.centavos` que virou `this.#centavos` pela
  metade, e `gerarParcelas` ainda montando `valorCentavos` em vez de `valor`;
- `node modulo-01/04-testes.ts` → quebra em runtime pelo mesmo motivo, e ainda dispara os
  relatórios de `05-contratos.ts`, que virou módulo e script ao mesmo tempo.

A classe `Money` está completa e com `#centavos`; os quatro testes que mentiam foram
corrigidos, inclusive o de imutabilidade. A lista do que falta está na
[aula 2.6](modulo-02/02-6-money-value-object.md).

O módulo passou a ter **dois tipos de teste, com dois comandos**:

| Arquivo | Como roda | O que prova |
|---|---|---|
| `04-testes.ts` | `node modulo-01/04-testes.ts` | o que o programa faz com valores válidos e inválidos |
| `06-testes-de-tipos.ts` | `pnpm typecheck` | o que o programa **não deixa nem escrever** |

## Próximos passos

1. Terminar a aula 2.6: resolver `money.ts`, corrigir os testes, `#centavos`.
2. Build: `tsc` gerando saída de verdade, não só `--noEmit`.
3. Fechar o [módulo 2](modulo-02/README.md).
4. Módulo 3 — Node e HTTP sem framework.

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
