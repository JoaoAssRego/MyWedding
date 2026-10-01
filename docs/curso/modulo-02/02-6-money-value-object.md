---
tipo: aula
modulo: 2
aula: "2.6"
status: concluida
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

**Status:** concluída — typecheck limpo, testes verdes, relatórios imprimindo.

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

### Terceira rodada — verde, e uma decisão de arquitetura sem querer

`tsc --noEmit` limpo e os 22 testes rodando: única `FALHOU` é a calibração, e nenhum relatório
é impresso no meio. `Contrato` virou classe com campos `#`, `gerarParcelas` mudou de casa para
`contrato/contrato.ts`, e `Parcela.valor` ficou coerente em todos os lugares.

O ponto interessante é o que veio junto sem estar na tarefa: `Contrato` ganhou um método
`exibirRelatorio()` que dá `console.log`. Isso é **I/O dentro do domínio**, e o
[README do projeto](../../../README.md) já decidiu o contrário: *"the `domain` folder imports
neither NestJS nor Prisma"* — regras de negócio que podem ser testadas com uma chamada de
função continuam assim.

A pergunta que separa as duas coisas: **quem mais vai chamar isso?** A API vai responder JSON,
a tela vai renderizar componentes, um relatório em PDF vai desenhar. Nenhum deles quer
`console.log`. O que todos querem é a **lista de parcelas e os totais** — dados. O `console.log`
pertence ao programa que imprime, não à classe.

Como `05-contratos.ts` foi apagado, ninguém chama `exibirRelatorio()`: ele é, hoje, código
morto. E o programa de demonstração — o único lugar onde o projeto "roda" como produto — sumiu
junto.

### Quarta rodada — testes de tipo de verdade, e a cópia que virou hábito

`06-testes-de-tipos.ts` foi reescrito e agora prova três coisas reais, cada uma de uma
natureza diferente:

| Linha | O que prova |
|---|---|
| `dividirEmParcelas(Money.deCentavos(90000))` | `Money` não é `QuantidadeParcelas` — dois tipos do domínio não se confundem |
| `dividirEmParcelas(6)` | `number` cru não entra onde se espera tipo marcado |
| `new Money(100)` | o construtor é privado: só se cria `Money` pela fábrica |

O caso do valor negativo saiu daqui, que é onde ele não podia estar. Esse é o arquivo fazendo
o trabalho que ele existe para fazer.

> [!warning] A cópia em vez da mudança, pela terceira vez
> `exibirRelatorio` foi **copiada** para `05-contrato.ts` e continua também dentro de
> `Contrato`. É o mesmo movimento que deixou o `money.ts` antigo apodrecendo e que espalhou o
> bug do `&&` entre `centavos.ts` e `quantidadeParcelas.ts`: ao mover código, a versão antiga
> tem que morrer no mesmo commit. Duas cópias da mesma regra significam que uma delas vai
> ficar para trás — a única dúvida é quando.

E o script novo ainda não é um script: `05-contrato.ts` **exporta** `exibirRelatorio` e não
chama nada. `node modulo-01/05-contrato.ts` roda, sai com código 0 e não imprime uma linha. Um
arquivo de entrada precisa montar os contratos e executar.

### Quinta rodada — o compilador cobrando o que falta

`exibirRelatorio` saiu de `Contrato`: a classe agora só devolve dados, e o `console.log` vive
no script. A duplicata acabou e a separação domínio × apresentação está feita.

O script monta os dois contratos — e para por aí, sem chamar `exibirRelatorio`. Dessa vez não
foi preciso ninguém perceber:

```
modulo-01/05-contrato.ts(25,7): error TS6133: 'contratoSalao' is declared but its value is never read.
modulo-01/05-contrato.ts(31,7): error TS6133: 'contratoFotografo' is declared but its value is never read.
```

É o `noUnusedLocals`, ligado na [aula 2.4](02-4-higiene-dos-testes.md), dizendo em bom som que
a tarefa ficou pela metade. Uma flag ligada há duas semanas pagando dividendo sozinha.

> [!caution] Quarta vez: nome não importado dentro de `@ts-expect-error`
> `new Money(centavos(100))` — `centavos` não está nos imports do arquivo (que importa só
> `Money`). O erro engolido pela diretiva é *"Cannot find name 'centavos'"*, de novo, e não o
> construtor privado que o comentário promete.

Daí nasce um ritual de verificação para testes de tipo, que vale tanto quanto o teste:

1. comente todas as linhas `@ts-expect-error`;
2. rode `pnpm typecheck`;
3. leia cada erro e confirme que é **o erro que você queria provar**;
4. descomente.

Sem isso, um arquivo de teste de tipos pode estar inteiro verde provando erros de digitação.

## Pendências

Para fechar a aula:

- `05-contrato.ts`: chamar `exibirRelatorio` para os dois contratos.
- `06-testes-de-tipos.ts`: importar `centavos`, e rodar o ritual das quatro etapas acima para
  conferir os quatro casos de uma vez.

Menores:

- Getters no estilo Java (`getNome()`, `getTotal()`). Em TypeScript idiomático seriam campos
  `readonly` públicos ou acessores `get nome()`, que se leem como propriedade.
- Descrições de teste ainda corrompidas pelo localizar-e-substituir: "a última tem
  **quantidadeParcelas** igual ao número de parcelas".

Decisões e pendências que continuam abertas:

- **`Money` pode ser negativo?** `subtrair` lança quando o resultado fica negativo, porque
  `centavos` recusa negativos. Ninguém tomou essa decisão explicitamente, e estorno e desconto
  dependem dela.
- `somaValorCentavos`, em `04-testes.ts`, é um `let` reaproveitado cinco vezes para guardar
  coisas diferentes — o nome só descreve o primeiro uso.
- Herdada: `if (parc[0] && parc[5])` ainda pula teste em silêncio.

## Fechamento

Verificação final, tudo verde:

- `tsc --noEmit` limpo;
- `node modulo-01/04-testes.ts` → 22 linhas, única `FALHOU` é a calibração;
- `node modulo-01/05-contrato.ts` → os dois relatórios, fechando com "A soma BATE com o total".

E o ritual das quatro etapas, rodado numa cópia do `06-testes-de-tipos.ts` com as diretivas
comentadas, confirma que cada linha prova exatamente o que o comentário dela afirma:

| Linha | Erro real do compilador |
|---|---|
| `dividirEmParcelas(Money.deCentavos(90000))` | TS2345: `Money` não é `QuantidadeParcelas` |
| `dividirEmParcelas(6)` | TS2345: `number` não é `{ __brand: "QuantidadeParcelas" }` |
| `new Money(centavos(100))` | TS2673: construtor privado |
| `Money.deCentavos(100) * 2` | TS2362: operando de aritmética precisa ser número |

Quatro proteções diferentes, cada uma com um mecanismo diferente por trás — tipo nominal
simulado, marca, visibilidade e ausência de conversão numérica. O entregável do módulo 2
("impossível de usar errado") tem, agora, prova executável.
