---
tipo: aula
modulo: 2
aula: "2.7"
status: em-andamento
conceitos:
  - build
  - outDir
  - esm
  - source-map
  - declaration
tags:
  - curso/aula
  - curso/modulo-02
---

# Aula 2.7 — O build: `tsc` emitindo JavaScript

**Status:** em andamento — tarefa passada.

## Contexto

Até aqui o `tsc` só **conferiu** (`--noEmit`), e quem executa o código é o Node, que entende
`.ts` direto desde a versão 22. Funciona no sandbox e não funciona em produção: um container
não roda `tsc`, e o Node lendo `.ts` é um atalho de desenvolvimento, não uma estratégia de
deploy.

Esta é a última aula do módulo 2, e ela fecha o ciclo: o mesmo código, compilado para
JavaScript, rodando sem nenhuma ferramenta de TypeScript por perto.

## Teoria

### O que o compilador faz com os tipos

Nada — ele os apaga. É literalmente o nome do processo: *type erasure*. Tudo que você escreveu
nas últimas seis aulas (`interface`, `: Money`, `Centavos`, `@ts-expect-error`) desaparece, e
sobra JavaScript comum.

Por isso a aula tem um exercício de leitura, e não só de configuração: abrir o `.js` gerado e
ver com os próprios olhos o que sobrou de cada coisa. É a prova do "custo zero" que foi afirmado
na [aula 2.5](02-5-branded-types.md) e da diferença entre `private` e `#` da
[aula 2.6](02-6-money-value-object.md).

### `outDir`, `rootDir` e por que não se compila por cima

`outDir` diz onde a saída vai (`dist/`), `rootDir` diz qual é a raiz da entrada — e é ele que
define a forma da árvore gerada. Saída separada da fonte é o que permite apagar tudo e
reconstruir sem medo, e é por isso que `dist/` está no `.gitignore`: ela é **derivada**, nunca
versionada.

### O conflito que vai aparecer

`allowImportingTsExtensions` — a flag que permite `import "./money.ts"` — exige `noEmit`.
Quando o compilador passa a emitir, ele precisa saber o que escrever no `import` do arquivo
gerado, e `"./money.ts"` não existe depois do build: o que existe é `./money.js`.

Em ESM o especificador de import é um **caminho literal**, resolvido em runtime pelo Node sem
nenhuma mágica — não há "resolução de extensão" como no CommonJS antigo. Alguém precisa
escrever `.js`. Duas saídas:

- escrever `.js` nos imports desde já, mesmo nos arquivos `.ts` (parece estranho e é o padrão
  consagrado em projetos ESM);
- manter `.ts` no código e deixar o compilador reescrever na emissão, com
  `rewriteRelativeImportExtensions`.

As duas são legítimas. Escolha uma e saiba dizer por quê — isso é parte da tarefa.

### `declaration`, `sourceMap` e os arquivos extras

O `tsconfig.json` já pede `declaration`, `declarationMap` e `sourceMap`, então o build vai
gerar mais que `.js`:

| Arquivo | Para quê |
|---|---|
| `.js` | o que o Node executa |
| `.d.ts` | os tipos, para quem **consome** o pacote compilado |
| `.js.map` | mapeia a linha do `.js` de volta para a linha do `.ts` — é isso que faz o stack trace e o depurador apontarem para o seu código |
| `.d.ts.map` | mapeia o tipo de volta à declaração original (o "ir para a definição" do editor) |

Sem o `.js.map`, um erro em produção aponta para a linha do JavaScript gerado, que não é a
linha que você escreveu.

## Tarefa

1. Ajustar `tsconfig.json`: `outDir`, `rootDir`, e resolver o conflito do
   `allowImportingTsExtensions` por uma das duas saídas acima.
2. Scripts no `package.json`: `build` (compila) e `clean` (apaga `dist/`). O `typecheck`
   continua como está — conferir e construir são comandos diferentes, e o rápido é o que você
   roda o tempo todo.
3. Rodar `pnpm build` e executar a saída: `node dist/modulo-01/05-contrato.js`.
4. Conferir que `dist/` não aparece no `git status`.
5. **Ler o que foi gerado** e responder:
   - o que sobrou de `types/centavos.ts` no `.js`?
   - o que aconteceu com `#centavos` e com os métodos de `Money`?
   - o que aconteceu com as quatro linhas de `06-testes-de-tipos.ts`?

## Verificação

```bash
cd sandbox && pnpm typecheck
cd sandbox && pnpm build
cd sandbox && node dist/modulo-01/05-contrato.js
cd sandbox && node dist/modulo-01/04-testes.js
```

Os dois últimos têm que imprimir **exatamente** o mesmo que as versões `.ts` imprimem hoje. Se
mudar qualquer coisa, a compilação alterou comportamento — e aí o problema é sério.

`git status` limpo depois do build.

Pergunta para responder em voz alta: **o arquivo `dist/modulo-01/types/centavos.js` é quase
vazio. Por quê, e o que isso diz sobre a diferença entre `Centavos` e `Money`?**

## O que aconteceu

_(a preencher)_
