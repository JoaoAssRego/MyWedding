---
tipo: progresso
atualizado: 2026-09-25
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
> **Módulo 2 — TypeScript**. A [aula 2.5 — Tipos marcados](modulo-02/02-5-branded-types.md)
> fechou; a [aula 2.6 — `Money` value object](modulo-02/02-6-money-value-object.md) acaba de
> ser passada e ainda não começou.

## Estado

Situação em 25/09/2026, pelo repositório (último commit `73b8077`), tudo verificado:

- `tsc --noEmit` limpo;
- `node modulo-01/04-testes.ts` roda até o fim, única `FALHOU` é a calibração;
- `node modulo-01/05-contratos.ts` fecha com "A soma BATE com o total".

O módulo passou a ter **dois tipos de teste, com dois comandos**:

| Arquivo | Como roda | O que prova |
|---|---|---|
| `04-testes.ts` | `node modulo-01/04-testes.ts` | o que o programa faz com valores válidos e inválidos |
| `06-testes-de-tipos.ts` | `pnpm typecheck` | o que o programa **não deixa nem escrever** |

## Próximos passos

1. Aula 2.6 — as três limpezas pendentes e depois a classe `Money`.
2. Build: `tsc` gerando saída de verdade, não só `--noEmit`.
3. Fechar o [módulo 2](modulo-02/README.md).
4. Módulo 3 — Node e HTTP sem framework.

## Pendências abertas

Cada uma aponta para onde nasceu. As três primeiras são a largada da aula 2.6.

- [ ] Construtores em PascalCase (`Centavos(...)`) parecem `new`; convenção é camelCase — [aula 2.5](modulo-02/02-5-branded-types.md)
- [ ] `Contrato.numero` é ambíguo com `Parcela.numero` — quantidade × ordinal — [aula 2.5](modulo-02/02-5-branded-types.md)
- [ ] Mensagem de `centavos` diz "maior que 0" enquanto a guarda aceita 0 — [aula 2.5](modulo-02/02-5-branded-types.md)
- [ ] Contrato de R$ 0,00: recusa intencional ou efeito colateral da guarda? Decidir junto com o item acima — [aula 2.2](modulo-02/02-2-revisao-do-modulo-1.md)
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
