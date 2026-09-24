---
tipo: aula
modulo: 2
aula: "2.5"
status: em-andamento
conceitos:
  - tipagem-estrutural
  - branded-types
  - smart-constructor
  - ts-expect-error
tags:
  - curso/aula
  - curso/modulo-02
---

# Aula 2.5 — Tipos marcados: um número que sabe o que é

**Status:** em andamento — tarefa passada.

## Contexto

O entregável do módulo 2 é o `Money` "impossível de usar errado". Hoje ele é possível de usar
errado de três jeitos, e os três compilam sem uma reclamação:

```ts
dividirEmParcelas(20, 390000);   // argumentos trocados
dividirEmParcelas(3900, 20);     // reais onde se espera centavos
dividirEmParcelas(390000, 20)[0] + formatarCentavos(5).length;  // centavos somados com lixo
```

A pergunta da aula anterior — *como fazer o TypeScript recusar isso?* — foi respondida
corretamente pelo João: **declarar um tipo próprio para o valor, diferente de `number`, porque
a função precisa receber centavos.** Esta aula é a execução dessa resposta, e a primeira
tentativa óbvia não funciona.

## Teoria

### Por que `type Centavos = number` não resolve nada

```ts
type Centavos = number;

function dividirEmParcelas(total: Centavos, n: number) { ... }

dividirEmParcelas(3900, 20);  // compila. Reais passando por centavos.
```

`type` cria um **apelido**, não um tipo novo. Depois da linha acima, `Centavos` e `number` são
literalmente a mesma coisa para o compilador, e qualquer número serve.

A causa é o TypeScript ser **estruturalmente tipado**: dois tipos são compatíveis quando têm a
mesma *estrutura*, não quando têm o mesmo *nome*. Em uma linguagem nominal (Java, C#), dois
tipos com os mesmos campos e nomes diferentes são incompatíveis; aqui, são intercambiáveis. É
o que permite escrever `{ nome: "x", totalCentavos: 1, numeroParcelas: 2 }` sem dizer
`new Contrato(...)` — e é também o que faz o apelido ser inútil como proteção.

### A marca (*brand*)

Como a compatibilidade é estrutural, para tornar dois tipos incompatíveis basta dar a um deles
uma estrutura que o outro não tem. A técnica é interseccionar o tipo primitivo com um objeto
que só existe no sistema de tipos:

```ts
// exemplo em outro domínio, de propósito
type Email = string & { readonly __brand: "Email" };
```

Agora `Email` é `string` para tudo que é operação de string, mas uma `string` qualquer **não**
é um `Email` — falta a marca. E o custo em runtime é zero: `__brand` nunca existe de verdade,
some junto com os tipos na compilação.

### O construtor inteligente

Se a marca não existe em runtime, ninguém consegue criá-la escrevendo um literal. É
exatamente o que se quer: existe **uma** porta de entrada, e ela valida.

```ts
export function email(valor: string): Email {
  if (!valor.includes("@")) throw new Error(`E-mail inválido: ${valor}`);
  return valor as Email;   // a única asserção legítima do arquivo
}
```

O `as` aqui não é gambiarra: é o ponto onde um valor cru vira um valor validado, e ele fica
confinado a uma função de três linhas que o resto do sistema não precisa reabrir. Fora dali,
`as` continua proibido.

O ganho não é o `throw` — isso as guard clauses já faziam. O ganho é que, **depois** dessa
função, o tipo carrega a prova da validação. Uma função que recebe `Email` não precisa
revalidar: se o valor chegou lá, passou pela porta.

### O que isso resolve na prática

Com `Centavos` e `QuantidadeParcelas` marcados, `dividirEmParcelas(20, 390000)` deixa de
compilar — não porque alguém escreveu uma checagem contra troca de argumentos, mas porque os
dois parâmetros passaram a ser tipos diferentes. O erro fica impossível de escrever, e o
teste que o cobria fica desnecessário.

### `@ts-expect-error`: testar o que **não** deve compilar

```ts
// @ts-expect-error reais não podem entrar onde se espera centavos
dividirEmParcelas(3900, 20);
```

O comentário diz ao compilador: *espero um erro na próxima linha*. Se o erro acontece, tudo
certo. Se a linha **passar** a compilar, o `tsc` falha reclamando de uma diretiva não
utilizada.

Ou seja: é um teste que roda no `pnpm typecheck` e que protege a proteção. No dia em que
alguém afrouxar a assinatura, esse teste quebra.

## Tarefa

1. Criar `modulo-01/types/centavos.ts` com o tipo marcado `Centavos` e o construtor
   `centavos(valor: number): Centavos`, que valida inteiro `>= 0` e lança se não for.
2. Criar da mesma forma `QuantidadeParcelas`, validando inteiro `>= 1`.
3. Mudar a assinatura para
   `dividirEmParcelas(total: Centavos, numero: QuantidadeParcelas): Centavos[]`, e ajustar
   `somarCentavos`, `formatarCentavos`, `Contrato` e `Parcela`.
4. Fazer o resto do código compilar de novo. As fixtures passam a ser construídas com
   `centavos(390000)`, e dentro de `dividirEmParcelas` o resultado do `Math.floor` é um
   `number` cru que precisa voltar a ser `Centavos`.
5. Rever as guardas de `dividirEmParcelas` e apagar as que ficaram **impossíveis** de violar.
   Toda guarda apagada deve poder ser justificada com "o tipo já garante isso".
6. Rever os `verificarErro` correspondentes. Alguns não vão mais compilar, porque a entrada
   inválida virou inexprimível — esses migram para `@ts-expect-error`, e é o que prova que a
   proteção existe.
7. Adicionar, com `@ts-expect-error`, pelo menos os dois casos da abertura: argumentos
   trocados e reais no lugar de centavos.

Não mude a lógica da divisão. É tarefa de tipos.

## Verificação

```bash
cd sandbox && pnpm typecheck
cd sandbox && node modulo-01/04-testes.ts
```

Typecheck limpo — o que agora significa mais do que antes, porque inclui os
`@ts-expect-error`. Os testes de runtime continuam com todos `OK` exceto a calibração falsa,
mas a lista deve ter **encolhido**: os erros que viraram impossíveis saíram de lá.

Pergunta para responder em voz alta ao final: **quais guardas de runtime sobraram, e por
quê?** Essa é a aula toda em uma frase.

## O que aconteceu

*(a preencher)*
