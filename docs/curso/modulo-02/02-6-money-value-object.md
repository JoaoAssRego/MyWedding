---
tipo: aula
modulo: 2
aula: "2.6"
status: em-andamento
conceitos:
  - value-object
  - imutabilidade
  - classe
  - campo-privado
  - factory-method
tags:
  - curso/aula
  - curso/modulo-02
---

# Aula 2.6 — `Money` como value object imutável

**Status:** em andamento — tarefa passada.

## Contexto

A [aula 2.5](02-5-branded-types.md) fechou: `Centavos` e `QuantidadeParcelas` são tipos
marcados, e os erros de unidade e de ordem de argumento não compilam mais. Falta o que o
[README do projeto](../../../README.md) promete: _"handled by an immutable `Money` value
object"_.

O que ainda é possível hoje, e não deveria ser:

```ts
const total = Centavos(390000);
const errado = total * 2; // number cru, a marca se perde no caminho
const pior = total + 0.5; // vira 390000.5 e nada reclama
```

A marca protege a **entrada** das funções. Ela não protege a **aritmética**: assim que um
`Centavos` entra numa conta, o resultado volta a ser `number` e todas as garantias evaporam.

## Teoria

### Value object

Um **value object** é um objeto definido inteiramente pelo seu valor, não por uma identidade.
Duas notas de R$ 50,00 são intercambiáveis; dois clientes chamados João, não. Três
consequências práticas:

- **Não tem id.** Comparar é comparar o valor, não o endereço na memória.
- **É imutável.** Nenhuma operação altera o objeto; toda operação devolve um novo. Somar 10 a
  um `Money` não muda aquele `Money` — produz outro.
- **Carrega as operações que fazem sentido para ele.** Somar dois `Money` faz sentido;
  multiplicar `Money` por `Money` não (R$ × R$ não é uma unidade que exista).

Comparado ao tipo marcado: a marca diz _o que o número é_; o value object diz, além disso,
_o que se pode fazer com ele_. `total * 2` deixa de existir como possibilidade, porque `Money`
não é um número — ele **contém** um.

### Imutabilidade não é decoração

```ts
const parcela = Money.deCentavos(100);
parcela.somar(Money.deCentavos(50));
console.log(parcela.formatar()); // R$ 1,00 — e tem que ser R$ 1,00
```

Se `somar` mudasse o objeto, qualquer outro lugar que tivesse uma referência para aquela
parcela veria o valor mudar sozinho. Em finanças isso é o bug que ninguém consegue reproduzir.
Método que muda o objeto se chama _mutação_; aqui não existe nenhum.

### `private` do TypeScript × `#` do JavaScript

```ts
class A {
  private x = 1;
} // some na compilação: em runtime, a.x funciona
class B {
  #x = 1;
} // privado de verdade: b.#x fora da classe é erro de sintaxe
```

`private` é uma regra do compilador; `#` é uma regra da linguagem. Como o objetivo aqui é que
ninguém consiga alcançar os centavos por fora e estragar a invariante, `#` é a escolha
coerente — a mesma lógica do `as` confinado ao construtor.

### Construtor privado e método de fábrica

O construtor fica privado e a criação passa por um método estático nomeado:

```ts
// exemplo em outro domínio, de propósito
class Temperatura {
  private constructor(readonly #kelvin: number) {}
  static deCelsius(c: number): Temperatura { ... }
  static deFahrenheit(f: number): Temperatura { ... }
}
```

Duas vantagens sobre `new Temperatura(300)`: o nome diz **em que unidade** o número está, e
dá para ter mais de uma porta de entrada sem ambiguidade. É o mesmo raciocínio do construtor
inteligente da aula 2.5, agora com um nome na porta.

## Tarefa

### Antes de começar, três limpezas pendentes

1. Construtores em camelCase: `centavos(...)` e `quantidadeParcelas(...)`, tipos seguem em
   PascalCase.
2. `Contrato.numero` → um nome que não se confunda com `Parcela.numero` (um é quantidade,
   o outro é ordinal).
3. A mensagem de erro de `centavos` diz "maior que 0" enquanto a guarda aceita `0`. Corrija a
   mensagem **ou** a guarda — e a escolha depende da decisão pendente desde a
   [aula 2.2](02-2-revisao-do-modulo-1.md): R$ 0,00 é um valor monetário válido? (Dica: é
   diferente de perguntar se um _contrato_ de R$ 0,00 é válido. Separar as duas perguntas é
   metade da resposta.)

### A aula

4. Criar `modulo-01/money/money.ts` com `class Money`:
   - campo privado `#centavos: Centavos`, construtor privado;
   - `static deCentavos(valor: number): Money`;
   - `somar(outro: Money): Money` e `subtrair(outro: Money): Money`, devolvendo novos objetos;
   - `dividirEmParcelas(quantidade: QuantidadeParcelas): Money[]`, reaproveitando a lógica que
     já existe — sem reescrever a distribuição do resto;
   - `formatar(): string`;
   - `igualA(outro: Money): boolean` e `maiorQue(outro: Money): boolean`.
5. `Contrato` e `Parcela` passam a guardar `Money`, não `Centavos`.
6. Migrar `04-testes.ts` e `05-contratos.ts` para a nova API.
7. Acrescentar a `06-testes-de-tipos.ts` pelo menos um `@ts-expect-error` provando que a
   aritmética crua com `Money` não compila (por exemplo, `Money.deCentavos(100) * 2`).
8. Escrever um teste de runtime que prove a imutabilidade: somar a um `Money` e verificar que
   o original não mudou.

## Verificação

```bash
cd sandbox && pnpm typecheck
cd sandbox && node modulo-01/04-testes.ts
cd sandbox && node modulo-01/05-contratos.ts
```

Typecheck limpo, testes com a única `FALHOU` sendo a calibração, e o relatório de contratos
continuando a fechar com "A soma BATE com o total" — a saída do `05-contratos.ts` não deve
mudar **nada**. Se mudar, a refatoração alterou comportamento.

Pergunta para responder em voz alta: **por que `Money` não tem um método `valor()` que devolve
o número cru?** (Se tiver, você acabou de reabrir a porta que a aula inteira fechou — a menos
que tenha um motivo, e há um.)

## O que aconteceu

### Primeira entrega — a classe nasceu, o módulo antigo não morreu

`money/money.ts` existe, com construtor privado, `deCentavos`, `somar`, `subtrair`,
`dividirEmParcelas`, `formatar`, `igualA` e `maiorQue`. `Contrato` e `Parcela` passaram a
guardar `Money`, e `05-contratos.ts` ficou bonito: a soma virou um `reduce` de `somar`, e a
conferência final virou `somaParcelas.igualA(contrato.total)`.

Decisões certas, sem eu pedir:

- **Não existe `valor()`.** A porta de saída não foi reaberta.
- **`Money.deCentavos(0)` como elemento neutro do `reduce`.** Isso responde, na prática, a
  pergunta aberta desde a [aula 2.2](02-2-revisao-do-modulo-1.md): R$ 0,00 **é** um valor
  monetário válido. O que continua inválido é um *contrato* sem valor — e a separação entre
  as duas perguntas é justamente a lição.
- A mensagem de `centavos` foi corrigida para "maior ou igual a 0", coerente com a guarda.

> [!caution] Estado: nada compila e nada roda
> `tsc --noEmit` acusa 7 erros e `node modulo-01/04-testes.ts` nem chega a executar. A causa é
> uma só: `modulo-01/money.ts` — o módulo de funções soltas — ficou para trás, ainda chamando
> `Centavos(...)` em PascalCase e lendo `contrato.numero`, que não existem mais.

A raiz do problema não é o esquecimento: é que a lógica da divisão foi **copiada** para dentro
de `Money.dividirEmParcelas` em vez de ter sido *movida*. Com duas cópias da mesma regra, uma
delas apodrece — e apodreceu. Toda migração tem esse momento; o que a resolve é decidir, para
cada função do arquivo antigo, se ela **vira método**, **muda de casa** ou **morre**:

| Função antiga | Destino |
|---|---|
| `dividirEmParcelas` | já é método de `Money` — a versão solta morre |
| `somarCentavos` | morreu: `reduce` + `somar` faz o mesmo |
| `formatarCentavos` | morreu: virou `Money.formatar()` |
| `gerarParcelas(contrato)` | não é sobre dinheiro, é sobre contrato — muda de casa |

### Os testes que mentem

Com o arquivo antigo consertado, a suíte ainda vai acusar falhas — e todas elas são o teste
errado, não o código errado:

1. `somarMoney(1750000 ÷ 6).igualA(Money.deCentavos(150000))` — o esperado certo é 1750000.
2. "Total de 10 dividido em 10 parcelas" executa `Money.deCentavos(1).dividirEmParcelas(1)`:
   é uma cópia do teste anterior, com a descrição do caso que não está sendo testado.
3. `verificarErro("total em centavos negativo", () => Money.deCentavos(100)...(5))` — 100
   centavos em 5 parcelas é perfeitamente válido. O caso pretendido é `deCentavos(-100)`.
4. O teste de imutabilidade (item 8 da tarefa) está invertido:
   `verificar("...", inicial.igualA(depois))` compara 10 com 30. O que prova imutabilidade é
   `inicial.igualA(Money.deCentavos(10))` — o original continuar valendo o que valia.

> [!warning] Descrição renomeada por substituição de texto, de novo
> "a primeira tem **quantidadeParcelas** igual a 1" — o mesmo localizar-e-substituir que
> corrompeu as descrições na [aula 2.4](02-4-higiene-dos-testes.md), repetido. Além disso, o
> teste de imutabilidade fala em "marcar não altera o **placar**", vocabulário de outro
> domínio. Texto dentro de string não é protegido por compilador nenhum.

### `@ts-expect-error` engole qualquer erro

Em `06-testes-de-tipos.ts`:

```ts
// @ts-expect-error reais crus não entram onde se espera Centavos
dividirEmParcelas(2000, QuantidadeParcelas(20));
```

`QuantidadeParcelas` em PascalCase não existe mais — o erro real dessa linha é
*"Cannot find name"*, não o erro de tipo que o comentário afirma. A diretiva aceita **qualquer**
erro na linha seguinte, então o teste continua "passando" pelo motivo errado.

A lição: `@ts-expect-error` é um instrumento grosso. A linha abaixo dele precisa estar correta
em tudo, menos no erro que se quer provar — senão o teste vira decoração.

### Segunda rodada — `#` revelou um bug que `private` escondia

Entregues: `#centavos` no lugar de `private centavos`, `Parcela.valor`, os quatro testes
corrigidos (inclusive o de imutabilidade, agora comparando `inicial` com
`Money.deCentavos(10)`), a linha solta apagada e `gerarParcelas` tirada do `money.ts`, que
deixou de existir.

E a troca para `#` pagou na hora:

```
money/money.ts(30,130): error TS2551: Property 'centavos' does not exist on type 'Money'.
                                      Did you mean '#centavos'?
```

Dentro da mensagem de erro de `dividirEmParcelas` sobrou um `this.centavos`. Com `private
centavos`, aquilo compilava e imprimia o valor; com `#`, não existe propriedade `centavos`
nenhuma e o compilador acusa. É a demonstração mais concreta possível da diferença entre uma
regra do compilador e uma regra da linguagem — o campo mudou de natureza, e um resto de código
antigo ficou visível.

### O módulo que executa ao ser importado, de novo

`gerarParcelas` mudou de casa — certo — mas foi parar em `05-contratos.ts`, que é um **script**:
as duas últimas linhas dele chamam `exibirRelatorio`. Como `04-testes.ts` agora importa
`gerarParcelas` de lá, rodar os testes executa os relatórios antes, e o stack trace da falha
aparece dentro de `05-contratos.ts` — um arquivo que ninguém pediu para rodar.

É exatamente o problema da [aula 2.2](02-2-revisao-do-modulo-1.md), item 1, de volta em outro
lugar: **módulo exporta; quem executa é o arquivo de entrada.** `gerarParcelas` pertence ao
domínio do contrato e precisa de um módulo só dele — algo como `contrato/contrato.ts` —, com
`05-contratos.ts` voltando a ser apenas o script que imprime.

## Pendências

Três erros de compilação separam a aula do fim:

- `money/money.ts:30` — `this.centavos` dentro da mensagem de erro deveria ser `this.#centavos`.
- `05-contratos.ts:48` — `gerarParcelas` ainda monta `{ numero, valorCentavos }`, mas `Parcela`
  agora tem `valor`. Renomeação incompleta.
- `gerarParcelas` precisa sair de `05-contratos.ts` para um módulo próprio que não execute nada
  ao ser importado.

E os testes de tipo:

- `06-testes-de-tipos.ts` chama `dividirEmParcelas`, que **não existe mais em lugar nenhum**.
  As duas primeiras linhas agora "passam" provando *"Cannot find name"* em vez do erro de
  tipo que os comentários afirmam. Precisam ser reescritas sobre `Money` — por exemplo, passar
  `Money` onde se espera `QuantidadeParcelas`.
- `// @ts-expect-error` sem descrição na linha de `Money.deCentavos(100) * 2`.

Decisões e pendências que continuam abertas:

- **`Money` pode ser negativo?** `subtrair` lança quando o resultado fica negativo, porque
  `centavos` recusa negativos. Ninguém tomou essa decisão explicitamente, e estorno e desconto
  dependem dela.
- `somaValorCentavos`, em `04-testes.ts`, é um `let` reaproveitado cinco vezes para guardar
  coisas diferentes — o nome só descreve o primeiro uso.
- Herdada: `if (parc[0] && parc[5])` ainda pula teste em silêncio.
