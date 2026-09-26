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
[README do projeto](../../../README.md) promete: *"handled by an immutable `Money` value
object"*.

O que ainda é possível hoje, e não deveria ser:

```ts
const total = Centavos(390000);
const errado = total * 2;        // number cru, a marca se perde no caminho
const pior   = total + 0.5;      // vira 390000.5 e nada reclama
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

Comparado ao tipo marcado: a marca diz *o que o número é*; o value object diz, além disso,
*o que se pode fazer com ele*. `total * 2` deixa de existir como possibilidade, porque `Money`
não é um número — ele **contém** um.

### Imutabilidade não é decoração

```ts
const parcela = Money.deCentavos(100);
parcela.somar(Money.deCentavos(50));
console.log(parcela.formatar());   // R$ 1,00 — e tem que ser R$ 1,00
```

Se `somar` mudasse o objeto, qualquer outro lugar que tivesse uma referência para aquela
parcela veria o valor mudar sozinho. Em finanças isso é o bug que ninguém consegue reproduzir.
Método que muda o objeto se chama *mutação*; aqui não existe nenhum.

### `private` do TypeScript × `#` do JavaScript

```ts
class A { private x = 1 }      // some na compilação: em runtime, a.x funciona
class B { #x = 1 }             // privado de verdade: b.#x fora da classe é erro de sintaxe
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
   diferente de perguntar se um *contrato* de R$ 0,00 é válido. Separar as duas perguntas é
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

*(a preencher)*
