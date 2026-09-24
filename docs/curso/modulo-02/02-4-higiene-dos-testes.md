---
tipo: aula
modulo: 2
aula: "2.4"
status: concluida
conceitos:
  - testes-que-falham-em-silencio
  - nomes-honestos
tags:
  - curso/aula
  - curso/modulo-02
---

# Aula 2.4 — Higiene dos testes e nomes honestos

**Status:** concluída — os 6 itens entregues; a limpeza final saiu junto.


## Contexto

A [aula 2.3](02-3-tipos-no-modulo-1.md) passou no compilador, mas a revisão encontrou seis
coisas: duas de fundo (testes de calibração apagados, `somar` mentindo no nome) e quatro de
higiene.

## Teoria

### Um conjunto de testes em que nada nunca falha não testa nada

Os testes de calibração tinham sido apagados na 2.3, e a saída passou a ter 21 linhas, todas
`OK`. Isso é indistinguível de um conjunto de testes quebrado: se o `verificar` fosse
corrompido — um `if (true)` no lugar do `if (condicao)` — tudo continuaria verde.

O teste de calibração **falso** é o único que prova que o verificador consegue reprovar. Ele
não é ruído na saída; é a linha mais importante dela. A mesma ideia volta no módulo 10 com
outro nome, mutation testing: estragar o código de propósito para ver se o teste percebe.

### Tipo literal e por que `1 === 2` não compila

Foi o que fez os testes de calibração serem apagados. `verificar("...", 1 === 2)` dá erro
2367: *"This comparison appears to be unintentional because the types '1' and '2' have no
overlap."* O TypeScript não vê dois `number` — vê os tipos **literais** `1` e `2`, que nunca
podem ser iguais, e recusa a comparação como código morto.

A saída usada foi anotar a variável, o que **alarga** o tipo literal para `number`:

```ts
const status: number = 1;
verificar("Calibração falsa: deve imprimir FALHOU", status === 2);
```

Sem a anotação, `const status = 1` teria tipo `1` e o erro voltaria. É a diferença entre o
tipo *inferido* de um `const` (literal) e o tipo *declarado* (alargado) — e é a primeira vez
no curso em que o tipo literal aparece como algo além de curiosidade.

### Renomear não é localizar e substituir

`somar` → `somarCentavos` foi feito com busca e substituição no texto, e o nome novo entrou
também dentro das descrições dos testes:

```
OK Total de 1750000 dividido em 6 parcelas deve somarCentavos 1750000
```

A descrição é português, não código. O compilador não protege texto dentro de string — o
`tsc` passou limpo com todas elas erradas. Renomeação se faz pelo *rename symbol* do editor
(F2 no VS Code), que entende o que é símbolo e o que é texto.

## Tarefa

1. Trazer de volta os dois testes de calibração.
2. Resolver o `somar`: ou `somarCentavos(valores: number[])`, ou `somar(parcelas: Parcela[])`
   com uma segunda função para números crus — com justificativa.
3. Adicionar o script `typecheck` ao `package.json`.
4. Apagar a linha `verificar("foram geradas parcelas", ...)` duplicada.
5. Trocar o `if (primeira && ultima)` por uma guarda que falha alto em vez de pular teste.
6. `const` no lugar de `let ultima`; apagar o comentário desatualizado em `money.ts`.

## Verificação

```bash
cd sandbox && pnpm typecheck
cd sandbox && node modulo-01/04-testes.ts
```

Todos `OK`, exceto "Calibração falsa", que deve imprimir FALHOU.

## O que aconteceu

`tsc --noEmit` passou limpo e a saída dos testes tem agora a linha que faltava:

```
OK Calibração verdadeira: deve imprimir OK
FALHOU Calibração falsa: deve imprimir FALHOU
```

Entregues: itens 1, 2, 3 e 6. A escolha no item 2 foi `somarCentavos(arrayParcelas: number[])`
— o nome passou a descrever o que a função realmente soma, e as chamadas com
`dividirEmParcelas(...)` continuaram válidas.

Numa primeira passada os itens 4 e 5 ficaram pela metade: a guarda `if (... === undefined)
throw` foi adicionada, mas o `if (primeira && ultima)` e o
`verificar(..., primeira !== undefined)` antigos continuaram no arquivo. Depois do `throw` o
compilador já estreitou os dois tipos — as verificações eram sempre verdadeiras e o `if`
sempre tomado. **Código morto que parece código vivo**, e o tipo de coisa que o compilador não
aponta sozinho: ele estava certo, só inútil.

Na segunda passada tudo foi limpo, junto com as pendências menores:

- linha duplicada removida; saída caiu de 22 para 21 linhas, sem repetição;
- descrições de teste corrigidas de volta para "deve somar";
- `noUnusedLocals` e `noUnusedParameters` ligados no `tsconfig.json`, e o import de `Parcela`
  que sobrava em `04-testes.ts` removido — agora é o compilador que cobra isso;
- `verificar` ganhou `: void`;
- `JSON.stringify` na mensagem do `throw`.

Verificação final: `tsc --noEmit` limpo, 21 linhas de saída, a única `FALHOU` sendo a
calibração falsa.

## Pendências

- `if (parc[0] && parc[5])` continua usando o mesmo padrão de "pular teste em silêncio" que
  foi corrigido em `primeira`/`ultima` — o teste da primeira parcela maior que a última não
  roda se o array vier curto, e ninguém fica sabendo.
- `arrayObjectParcelas`, em `money.ts`, ainda carrega "arrayObject" no nome (pendência desde
  a [aula 2.2](02-2-revisao-do-modulo-1.md)).
- Continua aberta a decisão sobre o contrato de R$ 0,00.
