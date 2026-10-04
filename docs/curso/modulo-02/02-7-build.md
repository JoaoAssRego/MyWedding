---
tipo: aula
modulo: 2
aula: "2.7"
status: concluida
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

**Status:** concluída — `dist/` só com o produto, `typecheck` enxergando tudo. Fecha o módulo 2.

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

### O build

Saída escolhida para o conflito do `allowImportingTsExtensions`:
**`rewriteRelativeImportExtensions`** — o código-fonte continua importando `./money.ts` e o
compilador reescreve para `./money.js` na emissão. Confere no gerado:

```js
// dist/money/money.js
import { centavos } from "../types/centavos.js";
```

`outDir: ./dist`, `rootDir: ./modulo-01` (a árvore gerada começa direto em `dist/04-testes.js`,
sem repetir o nome da pasta), `rimraf` para o `clean`, e `dist` já estava no `.gitignore`.

Verificação: `pnpm typecheck` limpo, `node dist/05-contrato.js` e `node dist/04-testes.js`
imprimindo exatamente o mesmo que as versões `.ts`.

### O que sobrou de cada coisa

**`types/centavos.ts` → quatro linhas de JavaScript.** Sumiram o `type Centavos`, a marca
`__brand` e o `as Centavos`. Sobrou só a validação:

```js
export function centavos(valor) {
    if (valor < 0 || !Number.isInteger(valor))
        throw new Error("Valor deve ser maior ou igual a 0 e Inteiro");
    return valor;
}
```

E o `.d.ts` guarda o outro lado — o tipo e a marca — para quem **consome** o pacote compilado.
O build separou em dois arquivos o que no `.ts` era um só: a metade que executa e a metade que
garante.

> [!tip] A resposta da pergunta final
> `centavos.js` é quase vazio porque `Centavos` **é só um tipo**: existe no compilador e em
> lugar nenhum depois dele. `Money` é uma **classe** — uma entidade de runtime, com métodos
> que o JavaScript executa. A marca é uma promessa verificada antes de rodar; o value object é
> um objeto que continua existindo enquanto o programa roda. Os dois protegem o mesmo dado por
> meios completamente diferentes.
>
> `types/parcela.js` é ainda mais extremo: sobrou **um import e nada mais** — a interface
> inteira evaporou.

**`#centavos` continuou; `private` e `public` sumiram.** Exatamente. E o construtor também
perdeu o `private`:

```js
export class Money {
    #centavos;
    constructor(centavos) { this.#centavos = centavos; }
```

Ou seja: no JavaScript gerado, `new Money(...)` **funciona**. A proteção do construtor privado
existe só enquanto o TypeScript está olhando — enquanto o campo `#` continua intransponível
para sempre, porque é regra da linguagem. É a aula 2.6 provada em disco.

**As quatro linhas de `06-testes-de-tipos.ts`: nada aconteceu.** Correto — e é aí que mora o
problema. As diretivas viraram comentários inofensivos e o restante virou JavaScript
executável, que foi parar em `dist/06-testes-de-tipos.js`. Rodando o arquivo gerado:

```
node dist/06-testes-de-tipos.js   →   exit 0, nenhuma saída
```

Silêncio. Nenhum dos quatro erros existe em runtime: `new Money(...)` passa,
`Money.deCentavos(100) * 2` devolve `NaN` sem reclamar, e
`dividirEmParcelas(Money.deCentavos(90000))` compara objeto com número, o laço não roda
nenhuma vez e a função devolve `[]` — um contrato sem parcela nenhuma.

> [!important] O resumo do módulo inteiro em uma linha
> `NaN` e `[]` em silêncio: é exatamente isso que o JavaScript faz com os quatro erros, e
> exatamente isso que o TypeScript recusou. A camada de tipos não deixou o programa mais
> seguro em runtime — ela impediu que esse código fosse **escrito**.

## Pendências — o último ajuste do módulo

O `dist/` de hoje contém `04-testes.js` e `06-testes-de-tipos.js`. Nenhum dos dois é o
produto: um é a suíte de testes, o outro é um arquivo que **nunca deveria rodar**. Um build
publica o que o consumidor usa, não o que o desenvolvedor usou para chegar lá.

A tentação é pôr os dois no `exclude` do `tsconfig.json` — e aí se perde a verificação, porque
`exclude` tira o arquivo do compilador inteiro, não só da emissão. Os testes de tipo deixariam
de ser testados, que é o oposto do objetivo.

O padrão que resolve: **duas configurações, dois trabalhos.**

- `tsconfig.json` — vê tudo, não emite nada. É o que o `typecheck` e o editor usam.
- `tsconfig.build.json` — `extends` o primeiro, acrescenta `exclude` dos testes, e emite.
  É o que o `build` usa.

Tarefa final da aula:

1. Criar `tsconfig.build.json` com `extends`, `exclude` dos dois arquivos de teste, e apontar
   o script `build` para ele (`tsc -p tsconfig.build.json`).
2. `pnpm clean && pnpm build` e conferir que `dist/` tem o domínio e os scripts, sem testes.
3. `pnpm typecheck` continua enxergando **todos** os arquivos, inclusive os testes de tipo —
   confirme rodando o ritual das quatro etapas uma última vez.

## Decisão — uma pasta `test/` (04/10/2026)

O João moveu os arquivos de teste para `modulo-01/test/` antes de escrever o
`tsconfig.build.json`. Boa ordem: com uma pasta, o `exclude` do build vira **uma linha**
(`"modulo-01/test"`) em vez de uma lista de arquivos que precisa ser lembrada a cada teste novo.
Arquivo de teste novo entra na pasta e já fica fora do `dist/` sem ninguém editar configuração.

Pontos levantados na revisão:

- [x] `05-contrato.ts` foi junto para `test/`, mas ele não verifica nada — ele **usa** o domínio
  e imprime o relatório. Com o `exclude` na pasta, ele sumiria do `dist/`, e a tarefa pede
  "o domínio e os scripts, sem testes". Pergunta para o João: o que separa um teste de um script?
- [x] O Git está vendo os três arquivos como *apagado + novo*. Fazer `git add` das duas pontas
  para ele detectar a renomeação e o `git log --follow` continuar enxergando o histórico.
- [x] `contrato.ts` ficou com imports misturados: dois com `.ts` e um com `.js`
  (`quantidadeParcelas.js`). Os dois funcionam com `rewriteRelativeImportExtensions`; escolher um.

Os três resolvidos: `05-contrato.ts` voltou para a raiz de `modulo-01/` (um script **usa** o
domínio, um teste **verifica** — e só o segundo fica fora do produto); o histórico de
`test/04-testes.ts` atravessa a mudança de pasta até o primeiro commit de teste
(`git log --follow`, 22 commits); e todos os imports do fonte usam `.ts`.

## Fechamento

### Verificação final

```
pnpm clean && pnpm build   →  dist/ com 05-contrato.js, contrato/, money/, types/ — sem testes
pnpm typecheck             →  limpo
node dist/05-contrato.js   →  os dois relatórios, "A soma BATE com o total"
node modulo-01/test/04-testes.ts → 22 linhas, única FALHOU é a calibração
```

### Duas configurações, provado

O ritual das quatro etapas, rodado numa cópia com as diretivas comentadas, contra cada uma das
duas configurações:

| Configuração | Resultado |
|---|---|
| `tsconfig.json` (a do `typecheck`) | os quatro erros esperados, um por linha |
| `tsconfig.build.json` (a do `build`) | exit 0 — **nem olha** para `test/` |

É a separação funcionando: quem verifica enxerga tudo, quem publica só enxerga o produto.

### O `dist/` que mentia

Antes do `clean`, o `dist/` ainda continha `04-testes.js` e `06-testes-de-tipos.js` de builds
anteriores. O `tsc` **nunca apaga** nada da pasta de saída: ele só escreve por cima do que
emite. Um arquivo que deixou de ser compilado continua lá, velho, até alguém apagar — e um
`dist/` com sobras é um `dist/` que não corresponde ao código-fonte.

Por isso o `clean` existe, e por isso costuma vir encadeado no `build`. Ficou como regra em
[`convencoes.md`](../convencoes.md).

## Pendências que atravessam para o próximo módulo

- **`Money` pode ser negativo?** `subtrair` lança abaixo de zero. A pergunta volta,
  obrigatoriamente, no módulo 4: a coluna do banco vai ter ou não um `CHECK (valor >= 0)`, e
  estorno de fornecedor precisa de uma resposta.
- `"**/*.spec.ts"` no `exclude` do build cobre um padrão que não existe no projeto. Inofensivo,
  mas é configuração especulativa — some ou ganha uso quando o módulo 10 trouxer um test runner.
- `"jsx": "react-jsx"` no `tsconfig.json` de um sandbox sem JSX: herança do template.
- Herdadas: `if (parc[0] && parc[5])` pula teste em silêncio; `arrayObjectParcelas` em
  `contrato.ts`; getters no estilo Java.
