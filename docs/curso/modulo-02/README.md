---
tipo: modulo
modulo: 2
status: concluido
tags:
  - curso/modulo
  - curso/modulo-02
---

# Módulo 2 — TypeScript

**Entregável:** o mesmo `Money` do módulo 1, agora tipado e impossível de usar errado.
**Onde vive o código:** `sandbox/modulo-01/` (nasce no sandbox e migra para `apps/api` no
módulo 5).
**Status:** concluído em 04/10/2026, com a [revisão oral](#revisão-oral-de-fechamento) fechada na terceira tentativa.

## Aulas

| # | Aula | Status |
|---|---|---|
| 2.1 | [Migração para `.ts` e tipos próprios](02-1-migracao-para-ts.md) | concluída |
| 2.2 | [Revisão do código do módulo 1](02-2-revisao-do-modulo-1.md) | concluída |
| 2.3 | [Fazer o módulo 1 passar pelo compilador](02-3-tipos-no-modulo-1.md) | concluída |
| 2.4 | [Higiene dos testes e nomes honestos](02-4-higiene-dos-testes.md) | concluída |
| 2.5 | [Tipos marcados: um número que sabe o que é](02-5-branded-types.md) | concluída |
| 2.6 | [`Money` como value object imutável](02-6-money-value-object.md) | concluída |
| 2.7 | [O build: `tsc` emitindo JavaScript](02-7-build.md) | concluída |

Módulo fechado: o `Money` é impossível de usar errado, com prova executável em
`test/06-testes-de-tipos.ts`, e o código compila para JavaScript que roda sem TypeScript.

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

Resolvidas:

- ~~Contrato de R$ 0,00~~ — R$ 0,00 **é** um valor monetário válido (`Money.deCentavos(0)` é o
  neutro da soma); contrato sem valor continua recusado pela guarda relacional. Resolvida na
  [aula 2.6](02-6-money-value-object.md).
- ~~Argumentos trocados e reais no lugar de centavos compilam~~ — não compilam mais, com prova
  em `test/06-testes-de-tipos.ts`. Resolvida nas aulas [2.5](02-5-branded-types.md) e
  [2.6](02-6-money-value-object.md).

Atravessam para os próximos módulos (detalhe na [aula 2.7](02-7-build.md#pendências-que-atravessam-para-o-próximo-módulo)):

- **`Money` pode ser negativo?** Volta obrigatoriamente no módulo 4, com o `CHECK` da coluna.
- `if (parc[0] && parc[5])`, `arrayObjectParcelas`, getters no estilo Java, `jsx` e
  `*.spec.ts` sobrando na configuração.

## Revisão oral de fechamento

O [plano](../00-plano-de-estudos.md) põe uma condição para fechar módulo: explicar em voz alta o
que foi escrito, **sem olhar o código**. As aulas estão todas verdes; esta é a última porta.

1. Por que `type Centavos = number` não protege nada, e o que a marca muda?
2. Dê um erro que o compilador pega e um que só o runtime pega, e diga por que cada um está
   onde está.
3. `private` e `#`: qual sobrevive ao build, e por que isso importa para `Money`?
4. O que `test/06-testes-de-tipos.ts` prova, e como você sabe que ele não está provando
   *"Cannot find name"*?
5. Por que existem dois `tsconfig`?

Respondidas, o módulo 2 fecha no [checklist do plano](../00-plano-de-estudos.md#progresso) e o
módulo 3 começa.

### Primeira tentativa — 04/10/2026

| # | Resposta do João (resumo) | Avaliação |
|---|---|---|
| 1 | "o tipo não aparece no JS, é visto como `number` comum" | **não fecha** — a marca também some no JS; apagar no build não pode ser o motivo |
| 2 | "compilador: tipo errado numa função; runtime: lógica errada" | **parcial** — a direção é certa, falta exemplo concreto e o critério que separa os dois |
| 3 | "`#` sobrevive ao build e mantém `centavos` inacessível" | **fecha** |
| 4 | "prova a lógica dos tipos" | **não fecha** — não respondeu como sabe que não é *"Cannot find name"* |
| 5 | "um configura o build, o outro executa" | **parcial** — pegou o `extends` + `exclude`, não o porquê de não ser um arquivo só |

Padrão das respostas: descrevem **o que** acontece, não **por que**. Uma pergunta de
acompanhamento por item em aberto, para a segunda tentativa:

1. A marca também desaparece no `.js` — você viu isso em `centavos.js`. Se desaparecer no build
   fosse o motivo, a marca também não protegeria. O que o compilador vê **antes** de apagar,
   que torna o apelido inútil e a marca útil?
2. Complete, com um exemplo do seu código em cada lado: *"o compilador pega os erros que dá para
   saber ___; o runtime pega os que só dá para saber ___."*
4. Como você me **mostraria** que a linha do construtor privado prova o construtor privado?
5. Se existisse um `tsconfig.json` só, com `exclude: ["modulo-01/test"]`, o que deixaria de
   funcionar?

### Segunda tentativa — 04/10/2026

| # | Resposta do João (resumo) | Avaliação |
|---|---|---|
| 1 | "`type` não cria tipo novo, é apelido — o compilador vê `Centavos` e `number` como a mesma coisa. `__brand` é marcação fantasma, **não é vista pelo compilador**" | **quase** — a primeira metade fecha; a segunda está invertida |
| 2 | função que recebe `string` chamada com `number` → compilador; `string` de 5 caracteres recusada por uma condição interna → runtime | **fecha** |
| 4 | "escrevo a linha **sem** o `@ts-expect-error` primeiro, vejo o erro, depois ponho o comentário" | **fecha** |
| 5 | "`tsconfig.json` cobre o repositório e faz o build completo; o `.build` mantém o build limpo, excluindo testes" | **quase** — a segunda metade fecha; a primeira atribui ao arquivo base um trabalho que ele não faz |

As duas que faltam erram no mesmo eixo: **quem enxerga o quê, e quando.**

- **1.** A marca é fantasma no sentido oposto: ela é vista **só** pelo compilador e por mais
  ninguém. É ela que faz o compilador recusar um `number` cru — se ele não a visse, não teria
  como recusar. Quem não a vê é o runtime: no `.js` ela não existe.
- **5.** O `tsconfig.json` não faz build: o `typecheck` roda com `--noEmit`. Ele **verifica** —
  inclusive os testes. E é por isso que o `exclude` não pode ir nele: os testes de tipo
  deixariam de ser verificados.

Pedido para a terceira tentativa: uma frase para cada, com as palavras **compilador** e
**runtime** na 1, e **verificar** e **emitir** na 5.

### Terceira tentativa — 04/10/2026: fecha

**1.** *"`type` cria só um apelido. Para o compilador, `Centavos` e `number` são o mesmo tipo,
então qualquer número passa. A marca torna o tipo estruturalmente diferente de `number`. Só o
compilador enxerga a marca, e é por isso que ele recusa um `number` cru. Ela é 'fantasma' para
o JavaScript: no `centavos.js` gerado ela não existe, então não há custo em runtime."*

**5.** *"O `tsconfig.json` verifica: é o que o `typecheck` (`tsc --noEmit`) lê. Cobre o
repositório inteiro, inclusive os testes, e não emite nada. O `tsconfig.build.json` emite:
estende o primeiro e adiciona o `exclude` para que o `dist/` saia só com o código da
aplicação."*

As duas com o eixo certo — o que existe na hora de conferir × o que existe na hora de rodar —, e
a 1 trouxe sozinha "estruturalmente diferente" e "sem custo em runtime", que não estavam na
pergunta.

> [!note] Um detalhe para o módulo 5
> "Não emite nada" é verdade por causa do `--noEmit` **no script**, não do arquivo: rodar
> `tsc` sem flag lê o `tsconfig.json` e despeja tudo no `dist/`, testes inclusive. Pôr
> `"noEmit": true` no próprio `tsconfig.json` (e `"noEmit": false` no `.build`) faz a regra
> morar na configuração, onde ninguém esquece. Vale fazer quando os `tsconfig` do monorepo forem
> montados.
