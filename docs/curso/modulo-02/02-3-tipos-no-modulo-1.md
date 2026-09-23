# Aula 2.3 — Fazer o módulo 1 inteiro passar pelo compilador

**Status:** concluída — verificação passou; a higiene que sobrou virou a [aula 2.4](02-4-higiene-dos-testes.md).

## Contexto

Saída direta da [aula 2.2](02-2-revisao-do-modulo-1.md): os cinco pontos levantados na revisão
viram uma tarefa só. Metade do módulo 1 está em TypeScript e a outra metade não, e é na metade
não verificada que moram os acessos por índice.

## Teoria

### `noUncheckedIndexedAccess`

Sem a flag, `const p = parcelas[0]` tem tipo `Parcela`. Mas e se o array estiver vazio? Em
runtime `p` é `undefined` e `p.numero` explode. Com a flag ligada o tipo passa a ser
`Parcela | undefined`, e o compilador obriga a lidar com o caso. É desconfortável de
propósito: ele está mostrando um bug que **já existia** — a flag não criou problema nenhum,
só tornou visível o que o JavaScript escondia.

Três saídas legítimas, em ordem de preferência:

1. **não indexar** — `for...of`, `.map`, `.reduce` entregam o elemento, nunca `undefined`;
2. **checar** — `if (p === undefined) throw new Error(...)`;
3. **`.at(-1)`** para o último, que é mais honesto que `arr[arr.length - 1]`.

Evitar `!` (non-null assertion): é jurar ao compilador que se sabe mais que ele. Às vezes é
verdade; em código de aprendizado, quase nunca.

### Tipo de retorno explícito

`export function somar(parcelas: Parcela[]): number` — a assinatura vira documentação e
barreira ao mesmo tempo. Sem ela, um erro na implementação muda silenciosamente o tipo de
retorno e o compilador só reclama lá na frente, em quem consome.

### `catch (e)` dá `unknown`

TypeScript tipa o parâmetro do `catch` como `unknown`, não `Error`, porque em JavaScript se
pode lançar qualquer coisa — `throw "texto"`, `throw 42`, `throw null` são todos válidos.
Logo, `e.message` não compila: primeiro é preciso estreitar o tipo
(`e instanceof Error ? ... : ...`) antes de acessar a mensagem.

## Tarefa

1. Remover do fim de `money.ts` o `contratoFotografo` e o `console.log`. O módulo só exporta.
2. Tipo de retorno explícito nas quatro funções exportadas.
3. Renomear `arrayObject`, em `gerarParcelas`, para algo que diga o que é.
4. Renomear `04-testes.js` → `04-testes.ts` e `05-contratos.js` → `05-contratos.ts`.
5. Corrigir todos os erros que aparecerem — principalmente em `verificar` / `verificarErro`,
   cujos parâmetros não têm tipo, e nos acessos por índice.
6. Fazer `somar` aceitar aquilo que o nome promete, e ajustar as chamadas.

Sem mudar a lógica de nenhuma função: é tarefa de tipos, não de comportamento.

## Verificação

```bash
cd sandbox && pnpm typecheck
```

Sem saída nenhuma = passou. Depois:

```bash
cd sandbox && node modulo-01/04-testes.ts
```

Todos `OK`, exceto o teste "Calibração falsa", que **deve** imprimir FALHOU — é ele que prova
que o verificador consegue reprovar.

## O que aconteceu

### O `npx tsc` que não era o `tsc`

A primeira tentativa de verificação usou `npx tsc --noEmit` (comando que eu passei errado) e
devolveu:

```
This is not the tsc command you are looking for
```

Causa: `sandbox/node_modules` não existia — o `pnpm install` nunca tinha sido rodado nesta
máquina. Sem o binário no projeto, o `npx` foi ao registro público, baixou um pacote chamado
`tsc` e o executou. Esse pacote não é o compilador TypeScript: é uma isca mantida justamente
para avisar quem caiu nessa. Nenhum dano — ele só imprime o aviso — mas o mecanismo é o que
importa: **`npx` executa código que você não instalou.** Com um typo (`tpescript`), o final
pode não ser um aviso.

O aviso do PowerShell sobre executar `npx.ps1` é outra coisa, benigna: política de execução do
Windows para arquivos `.ps1`.

Correção, que virou regra em [`convencoes.md`](../convencoes.md):

```bash
cd sandbox && pnpm install
```

e a verificação passa a ser um script no `package.json`:

```json
"scripts": {
  "typecheck": "tsc --noEmit"
}
```

Dentro de um script do `package.json`, `node_modules/.bin` já está no PATH, então `tsc`
resolve sozinho.

### Resultado da tarefa

Depois do `pnpm install`, o compilador passou limpo (`tsc --noEmit`, saída vazia) e os testes
rodaram com `node modulo-01/04-testes.ts`. O executável do `typescript@7` **é** `tsc` — a
pendência sobre o nome do binário está resolvida.

Entregue corretamente:

- efeito colateral removido de `money.ts`;
- tipo de retorno explícito nas quatro funções exportadas;
- os dois arquivos migrados para `.ts`;
- `e instanceof Error` no `catch`, com `String(e)` no outro ramo — sem `!` e sem `as`;
- `.at(-1)` no lugar de `arr[arr.length - 1]`;
- `for...of` substituindo o `for (let i...)` na soma: a saída número 1 da aula, parar de
  indexar em vez de checar o índice;
- fixture anotado com `: Contrato`, o que faz um typo estourar na declaração.

Ficou pendente e virou a [aula 2.4](02-4-higiene-dos-testes.md): os testes de calibração
apagados, `somar` ainda aceitando `number[]`, o script `typecheck` fora do `package.json`,
uma linha de verificação duplicada e o `if (primeira && ultima)` que pulava teste em silêncio.
