---
tipo: aula
modulo: 2
aula: "2.5"
status: concluida
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

**Status:** concluída — typecheck limpo, testes rodando até o fim, os 7 itens entregues.

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

### Itens 1 a 4: entregues

`types/centavos.ts` e `types/quantidadeParcelas.ts` com marca e construtor, assinaturas
trocadas em `dividirEmParcelas`, `somarCentavos`, `formatarCentavos`, `Contrato` e `Parcela`,
e todas as chamadas ajustadas. `tsc --noEmit` passa limpo, e o `[]` que aparecia em
`gerarParcelas` sumiu com as fixtures corrigidas.

Três decisões acertadas, que valem registro:

- **`Parcela.numero` continuou `number` cru.** É um ordinal — "a terceira parcela" — não uma
  quantidade nem um valor. Marcar tudo que é número seria marcar nada.
- **`Contrato.totalCentavos` virou `total: Centavos`.** Com a unidade dentro do tipo, o sufixo
  no nome vira redundância. É a diferença entre documentar no nome e garantir no tipo.
- **`somarCentavos` devolve `Centavos`** passando o resultado pelo construtor, em vez de um
  `as`. A revalidação é barata e mantém o `as` confinado a um lugar só.

### O bug do `&&`: a guarda que não guardava

Os testes de runtime acusaram três `FALHOU`:

```
FALHOU parcelas negativas
FALHOU valor não inteiro para parcelas
FALHOU zero parcelas
```

Causa, em `types/quantidadeParcelas.ts`:

```ts
if (quantidade < 1 && !Number.isInteger(quantidade)) throw new Error(...)
```

Com `&&`, só é recusado o valor que é **ao mesmo tempo** menor que 1 **e** não inteiro. `0`,
`-1` e `2.5` passam cada um por falhar em uma das duas metades. O mesmo erro existia em
`centavos.ts` e foi corrigido lá (`||`, commit `730a13b`) sem que a correção fosse levada para
o arquivo irmão.

> [!warning] O que o bug causou de verdade
> `dividirEmParcelas(Centavos(10), QuantidadeParcelas(2.5))` devolveu `[4, 4, 4]` — 12 centavos
> a partir de um total de 10. Com `0` e `-1`, devolveu `[]` em silêncio: um contrato sem
> nenhuma parcela, e nenhum erro. É exatamente a classe de bug que o módulo inteiro existe para
> impedir.

A lição sobre validação: `<1` e "não inteiro" são duas maneiras **independentes** de a entrada
ser inválida, então a recusa é `||`. Uma guarda com `&&` entre condições independentes é quase
sempre uma guarda que não guarda nada — e, pior, uma que *parece* guardar.

A lição sobre teste: a suíte pegou os três. Foi a [aula 2.4](02-4-higiene-dos-testes.md)
pagando juros — sem os testes de erro e sem a calibração provando que a suíte consegue
reprovar, esse bug entraria no banco de dados como dinheiro inventado.

### O `&&` corrigido, e um teste que mata o programa

Commit `841ae85`: `||` no lugar do `&&` em `quantidadeParcelas.ts`. Os três `FALHOU` viraram
`OK` — `0`, `-1` e `2.5` são recusados pelo construtor.

Os dois `@ts-expect-error` do item 7 foram escritos e estão corretos: `tsc --noEmit` passa,
o que prova que as duas linhas **realmente** não compilam. Só que a execução do arquivo termina
assim:

```
Error: Total em centavos deve ser > numero de Parcelas, recebido: Número de Parcelas =390000 e Total em Centavos=20
    at dividirEmParcelas (money.ts:12:11)
    at 04-testes.ts:133:1
```

> [!important] `@ts-expect-error` silencia o compilador, não o runtime
> A diretiva diz "espero um erro de **tipo** aqui" e o `tsc` para de reclamar. O código
> continua sendo código: `node` executa a linha normalmente, e a chamada com os argumentos
> trocados estoura de verdade — matando os testes que viessem depois.

Daí a regra: **teste de compilação não pode ser uma instrução executável no meio de um teste
de runtime.** Ou ele vive em um arquivo que só o compilador lê e ninguém executa, ou fica
dentro de uma função exportada que nunca é chamada. Os dois funcionam; o arquivo separado é
mais honesto, porque o nome diz o que ele é.

### Item 6: nada para migrar, e saber por quê é a resposta

Nenhum `verificarErro` virou `@ts-expect-error` — e está certo. Todos eles passam o valor
inválido por um construtor (`QuantidadeParcelas(-1)`, `Centavos(-100)`), e construtor é função:
recebe `number`, compila, e só recusa em runtime. O que virou inexprimível foi outra coisa —
passar um `number` cru onde se espera `Centavos` —, e é exatamente isso que os dois testes do
item 7 cobrem.

A divisão que a aula queria ensinar:

| Erro | Onde é pego | Por quê |
|---|---|---|
| `number` cru no lugar de `Centavos` | compilação | os tipos são incompatíveis por estrutura |
| argumentos trocados | compilação | `Centavos` e `QuantidadeParcelas` são tipos diferentes |
| `-1`, `0`, `2.5` parcelas | runtime | o construtor recebe `number`; só o valor concreto revela |
| `numero > total` | runtime | é uma relação **entre dois valores**, não uma propriedade de um |

### Item 5: a guarda que sobrou

Resposta do João: *"deve sobrar, pois está sendo verificado o que foi passado e não tem nada
relacionado à validação do número em si"* — correto, e o nome disso é **invariante
relacional**. `Centavos` garante propriedades de um valor sozinho; "o total tem que caber em
tantas parcelas" só existe na relação entre os dois, e nenhum dos dois tipos pode carregá-la.
Um sistema de tipos dependentes expressaria isso; o do TypeScript, não. Por isso essa guarda
continua sendo de runtime, e é a única de `dividirEmParcelas` que sobreviveu.

### Fechamento

Os dois `@ts-expect-error` saíram de `04-testes.ts` e ganharam arquivo próprio,
`06-testes-de-tipos.ts` — um arquivo que o `tsc` lê e que ninguém executa. Surgiu daí a
separação que o módulo queria ensinar: **dois tipos de teste, dois comandos.**

| Arquivo | Como roda | O que prova |
|---|---|---|
| `04-testes.ts` | `node modulo-01/04-testes.ts` | o que o programa faz com valores válidos e inválidos |
| `06-testes-de-tipos.ts` | `pnpm typecheck` | o que o programa **não deixa nem escrever** |

`verificarErro` passou a imprimir a descrição junto da mensagem, e a saída agora identifica
cada caso.

Verificação final: `tsc --noEmit` limpo, `04-testes.ts` rodando até o fim sem stack trace,
única `FALHOU` sendo a calibração, e `05-contratos.ts` fechando com "A soma BATE com o total".

## Pendências

- Os construtores são funções em PascalCase (`Centavos(...)`, `QuantidadeParcelas(...)`), o que
  faz uma chamada de função parecer um `new`. Convenção: tipo em PascalCase, função em
  camelCase.
- `Contrato.numero` é ambíguo com `Parcela.numero` — um é quantidade, o outro é ordinal.
- Mensagem de erro de `Centavos`: "Valor deve ser maior que 0" enquanto a guarda aceita 0.
