---
tipo: progresso
atualizado: 2026-09-24
modulo_atual: 2
aula_atual: "2.5"
aliases:
  - Onde estou
tags:
  - curso
---

# Onde estou

Nota viva: diz em que ponto da trilha o João está **agora**. É a primeira coisa que o Claude lê
antes de uma aula, e é reescrita ao final de cada sessão — o histórico fica nas aulas, não aqui.

> [!abstract] Agora
> **Módulo 2 — TypeScript**, [aula 2.5 — Tipos marcados](modulo-02/02-5-branded-types.md).
> Tarefas 1 a 3 entregues em commits; tarefa 4 em andamento.

## Estado da aula atual

Situação em 24/09/2026, pelo repositório (último commit `9171852`):

| Item da tarefa | Situação |
|---|---|
| 1. `Centavos` + construtor | feito — `types/centavos.ts` |
| 2. `QuantidadeParcelas` + construtor | feito — `types/quantidadeParcelas.ts` |
| 3. Assinaturas de `dividirEmParcelas`, `somarCentavos`, `formatarCentavos`, `Contrato`, `Parcela` | feito |
| 4. Resto do código compilando | **em andamento** — `pnpm typecheck` falha em `04-testes.ts` (fixtures ainda com `number` cru) |
| 5. Apagar guardas impossíveis | não começado |
| 6. `verificarErro` → `@ts-expect-error` | não começado |
| 7. Os dois casos da abertura com `@ts-expect-error` | não começado |

> [!warning] Observado ao rodar os testes, ainda não investigado
> `node modulo-01/04-testes.ts` para no teste de `gerarParcelas`: a função devolve `[]`. Pode ser
> efeito da migração de tipos ainda incompleta — é para olhar na entrega da tarefa 4, junto com
> o João, não para consertar por ele.

## Próximos passos

1. Terminar a aula 2.5 e responder em voz alta: *quais guardas de runtime sobraram, e por quê?*
2. `Money` como value object imutável.
3. Build: `tsc` gerando saída de verdade, não só `--noEmit`.
4. Fechar o [módulo 2](modulo-02/README.md) e resolver as pendências dele.
5. Módulo 3 — Node e HTTP sem framework.

## Pendências abertas

Coletadas das aulas; cada uma aponta para onde nasceu.

- [ ] Contrato de R$ 0,00: recusa intencional ou efeito colateral da guarda? — [aula 2.2](modulo-02/02-2-revisao-do-modulo-1.md)
- [ ] `if (parc[0] && parc[5])` pula o teste em silêncio se o array vier curto — [aula 2.4](modulo-02/02-4-higiene-dos-testes.md)
- [ ] `arrayObjectParcelas` ainda carrega "arrayObject" no nome — [aula 2.2](modulo-02/02-2-revisao-do-modulo-1.md)

## O que já domina

O que foi entregue **e** verificado — não o que foi só lido.

- **JavaScript:** variáveis, funções, arrays, objetos, erros, módulos; divisão de parcelas sem
  perder centavo (módulo 1).
- **TypeScript:** anotação de tipos, `interface`, `import type`, `tsconfig` rigoroso
  (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`) — aulas 2.1 a 2.4.
- **Tipagem estrutural:** respondeu sozinho que a saída para "reais no lugar de centavos" era
  um tipo próprio, diferente de `number` (abertura da 2.5).
- **Ferramentas:** Git e Conventional Commits no dia a dia, pnpm, script de `typecheck`.

## Ver também

- [Plano de estudos](00-plano-de-estudos.md) — o mapa completo e o checklist de módulos
- [Como eu ensino](como-ensinar.md) — o método das aulas
- [Aulas](aulas.base) — todas as aulas com status
