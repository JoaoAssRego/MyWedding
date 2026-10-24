---
tipo: aula
modulo: 4
aula: "4.3"
status: em-andamento
conceitos:
  - array
  - hash
  - range
  - bloco
  - yield
  - enumerable
tags:
  - curso/aula
  - curso/modulo-04
---

# Aula 4.3 — Coleções, blocos e `Enumerable`: as parcelas como lista

**Status:** em andamento — tarefa passada.

## Contexto

O [`01-divisao.rb`](04-1-ruby-em-docker.md) calcula **dois números**: a base (`64814`) e o resto
(`22`). Mas um contrato não tem "uma base e um resto" — tem **27 parcelas**, 22 de `64815` e 5
de `64814`. No TypeScript isso é o `Money#dividirEmParcelas`, que devolve um array, e o
`Contrato#gerarParcelas`, que numera cada uma.

O que os dois têm por dentro é um `for` com contador e `push`:

```ts
for (let i = 0; i < quantidade; i++) {
  arrayParcelas.push(
    new Money(centavos(valorParcelaCentavos + (i < centavosRestantes ? 1 : 0))),
  );
}
```

Em Ruby quase nunca se escreve isso. A aula é sobre o porquê, e sobre o que se escreve no
lugar.

## Teoria

### Três coleções

```ruby
# exemplo em outro domínio, de propósito: notas de uma turma
grades  = [7, 9, 4, 10]               # Array — como o array do JS
student = { name: "Ana", grade: 9 }   # Hash — como um objeto literal do JS
weeks   = 1..4                        # Range — 1, 2, 3, 4 (com três pontos, 1...4, para no 3)
```

- **Array:** `grades.first`, `grades.last`, `grades.size`, `grades << 8` (o `push`), e índice
  negativo conta do fim: `grades[-1]` é o último. O `fetch` da 4.2 vale aqui.
- **Hash:** as chaves acima são **símbolos** — `student[:grade]` dá `9`. E `student["grade"]`
  dá `nil`: a string `"grade"` e o símbolo `:grade` são chaves **diferentes**. Repare que o `p`
  do Ruby 4.0 mostra o hash como `{name: "Ana", grade: 9}`; tutoriais antigos mostram
  `{:name=>"Ana", :grade=>9}` — é a mesma coisa.
- **Range:** um intervalo, sem guardar os números um a um. `(1..4).to_a` vira o array.

### Bloco: a função que você passa

```ruby
grades.map { |g| g + 1 }        # => [8, 10, 5, 11]
```

O que vai entre `{ }` é um **bloco**: um pedaço de código que o método chama, recebendo
argumentos entre `| |`. Você já usa isso todo dia em JS — `grades.map(g => g + 1)`. A diferença
é que em Ruby o bloco não é um argumento entre os parênteses: ele vem **depois** da chamada, e
cada método recebe no máximo um.

Duas grafias, mesmo significado: `{ |g| … }` para uma linha, `do |g| … end` para várias.

```ruby
grades.each do |g|
  puts "nota: #{g}"
end
```

### `yield`: escrevendo um método que recebe bloco

```ruby
def twice
  yield
  yield
end

twice { print "x" }   # imprime xx
```

`yield` chama o bloco que veio junto com a chamada (e `yield valor` passa um argumento para
ele). É assim que o `map` e o `each` são feitos por dentro. Lembra do `verificarErro` do
módulo 1, que recebia `fn: () => void` para poder rodar o código **dentro** de um `try`? Em Ruby,
esse `fn` é um bloco.

### `Enumerable`: o que substitui o `for`

Array, Hash e Range respondem ao mesmo conjunto de métodos. Os que mais aparecem:

| Ruby                                 | O que faz                                | JavaScript                               |
| ------------------------------------ | ---------------------------------------- | ---------------------------------------- |
| `each { \|x\| … }`                   | percorre; **devolve a própria coleção**  | `forEach` (devolve `undefined`)          |
| `map { \|x\| … }`                    | transforma; devolve uma coleção nova     | `map`                                    |
| `select { \|x\| … }` / `reject`      | filtra mantendo / tirando                | `filter`                                 |
| `find { \|x\| … }`                   | o primeiro que casa                      | `find`                                   |
| `sum`                                | soma                                     | `reduce((a, b) => a + b, 0)`             |
| `count(valor)` / `count { \|x\| … }` | quantos                                  | `filter(…).length`                       |
| `all? { … }` / `any? { … }`          | todos / algum                            | `every` / `some`                         |
| `each_with_index { \|x, i\| … }`     | spercorre com o índice                   | `forEach((x, i) => …)`                   |
| `map.with_index(1) { \|x, n\| … }`   | transforma com índice **começando em 1** | —                                        |
| `n.times.map { \|i\| … }`            | `0` a `n - 1`, transformado              | `Array.from({ length: n }, (_, i) => …)` |

```ruby
grades.select { |g| g >= 7 }                 # => [7, 9, 10]
grades.sum                                    # => 30
grades.count { |g| g < 5 }                    # => 1
grades.map.with_index(1) { |g, n| "#{n}ª: #{g}" }
# => ["1ª: 7", "2ª: 9", "3ª: 4", "4ª: 10"]
```

A armadilha clássica de quem vem do JS: **`each` não constrói nada.** Ele devolve a coleção
original, sem mudança. Para obter uma lista nova, é `map` — e o `map!`, com `!`, altera a
original (a regra da 4.2).

### Um detalhe: `is_a?`

`2.5.is_a?(Integer)` é `false`; `3.is_a?(Integer)` é `true`. É o `Number.isInteger` do
`quantidadeParcelas` — um método que pergunta, por isso o `?`.

## Tarefa

1. **`irb` com previsão** — previsão, resultado e **o que o JavaScript daria**. A terceira
   coluna ficou de fora nas aulas 4.1 e 4.2; aqui ela é parte da entrega.

   ```ruby
   [1, 2, 3].map { |n| n * 2 }
   [1, 2, 3].each { |n| n * 2 }
   (1..5).to_a
   (1...5).to_a
   [10, 20, 30].sum
   [10, 20, 30].select { |n| n > 15 }
   3.times.map { |i| i }
   { number: 1, amount: 64815 }[:amount]
   { number: 1, amount: 64815 }["amount"]
   ```

2. **`sandbox/modulo-04/03-split-installments.rb`**, com quatro métodos:
   - `check(description, condition)` — o `verificar` do módulo 1 em Ruby: imprime `OK` ou
     `FALHOU` seguido da descrição.
   - `check_error(description)` — o `verificarErro`: recebe um **bloco**, roda com `yield`, e
     imprime `OK` se ele lançar `ArgumentError`, `FALHOU` se não lançar.
   - `split_installments(total_cents, count)` — devolve um **array de inteiros**: a mesma regra
     do `dividirEmParcelas`, com o resto distribuído, 1 centavo a mais, **nas primeiras**
     parcelas. Lança `ArgumentError` quando `count` não for um inteiro maior ou igual a 1,
     quando `total_cents` for negativo, e quando `total_cents` for menor que `count`.
   - `installments(total_cents, count)` — devolve um array de hashes
     `{ number: 1, amount_cents: 64815 }`, numerados a partir de 1, **usando**
     `split_installments`.

3. **Os casos**, nesta ordem, cada um com `check` ou `check_error`:

   | #   | Caso                                                                     |
   | --- | ------------------------------------------------------------------------ |
   | 1   | calibração: `check("calibração: deve imprimir FALHOU", false)`           |
   | 2   | `split_installments(1750000, 27)` tem 27 parcelas                        |
   | 3   | e elas somam `1750000`                                                   |
   | 4   | a primeira é `64815` e a última é `64814`                                |
   | 5   | exatamente 22 parcelas valem `64815`                                     |
   | 6   | `split_installments(100, 3)` é `[34, 33, 33]`                            |
   | 7   | `split_installments(1, 1)` é `[1]`                                       |
   | 8   | `installments(1750000, 27).first` é `{ number: 1, amount_cents: 64815 }` |
   | 9   | `installments(1750000, 27).last[:number]` é `27`                         |
   | 10  | `count` igual a `0` lança `ArgumentError`                                |
   | 11  | `count` igual a `2.5` lança `ArgumentError`                              |
   | 12  | `total_cents` igual a `-1` lança `ArgumentError`                         |
   | 13  | `5` centavos em `10` parcelas lança `ArgumentError`                      |

4. **Regras:** nenhum `for`, nenhum `while`, nenhum contador manual (`i += 1`), nenhum `return`,
   nenhum `Float`, nenhum `<<` dentro de `each` para montar a lista. Nomes em inglês, _snake_case_.
5. **Rodar a verificação antes do commit.** Um commit `feat:`, assunto no imperativo.

## Verificação

```bash
docker compose run --rm ruby ruby -w sandbox/modulo-04/03-split-installments.rb
```

Treze linhas: a primeira `FALHOU` (a calibração), as outras doze `OK`. Nenhum `warning`.

```bash
docker compose run --rm ruby grep -nE "\bfor\b|while|\+= 1|return|to_f|\.0\b" sandbox/modulo-04/03-split-installments.rb
```

Nenhuma linha — inclusive em comentário. (Pelo container, para o `grep` ser o mesmo em qualquer
máquina.)

E a prova de que os testes protegem: troque, por um instante, a regra para o resto ir para as
**últimas** parcelas. Rode, anote **quais** casos passam a `FALHOU` — e se algum caso que você
esperava falhar continuou `OK`, explique por quê. Desfaça.

Perguntas para responder em voz alta:

1. **`each` e `map` recebem o mesmo bloco. O que cada um devolve — e qual seria o bug de quem
   usasse `each` para montar a lista de parcelas?**
2. **Por que `{ number: 1 }["number"]` é `nil`? O que isso tem a ver com a aula 4.2?**

## O que aconteceu

As mensagens dos testes em `03-split-installments.rb` foram detalhadas para explicar a regra
verificada em cada caso: quantidade, soma, distribuição do resto, numeração e entradas inválidas.
A sintaxe foi conferida com `ruby -c`. A verificação pelo comando da aula ficou pendente porque o
Docker Desktop não estava disponível nesta sessão.

### Revisão 1 — 23/10/2026: não fecha

Commits `aa55263` e `cef281f` (os métodos); os casos de teste estão na árvore de trabalho, não
commitados. O commitado roda sem erro — desta vez nada quebrado foi para o histórico.

> [!warning] Verificação feita fora do container
> O Docker Desktop estava desligado de novo. Para não deixar a revisão sem resultado, o script
> rodou no Ruby do Windows (4.0.7, a mesma versão) **só como diagnóstico**. Pela
> [convenção](../convencoes.md#ruby-roda-no-container), a verificação que fecha a aula é a do
> container.

```text
$ ruby -w sandbox/modulo-04/03-split-installments.rb      # Ruby do Windows, diagnóstico
FAILED, calibration: intentionally uses false so the test helper prints FAILED
OK, split_installments(1750000, 27) should return exactly 27 installments
…/03-split-installments.rb:60:in 'Integer#+': nil can't be coerced into Integer (TypeError)
```

O que está bom: `Array.new(count) { |i| … }` no lugar do `for` — a forma idiomática, com a
mesma regra do `dividirEmParcelas`; guardas na ordem certa (o `is_a?(Integer)` vem **antes** do
`count < 1`, então `2.5` nunca chega a ser comparado); `installments` reaproveitando
`split_installments` com `map.with_index(1)`; `check_error` com `yield`.

**O que impede de fechar:**

1. **Caso 3 quebra o script.** `array_installments.map { |i| sum += array_installments[i] }`:
   - _no `map`, o que o `|i|` recebe — o índice ou o valor?_ (Com `64815` no lugar do índice,
     `array_installments[64815]` é `nil`, e `sum += nil` é o `TypeError`.)
   - mesmo sem o erro, o `map` devolve um **array**, e array nunca é `== 1750000`;
   - e `sum = 0` com `sum +=` é o contador manual que a regra 4 proíbe. A tabela da teoria tem
     o método que faz isso numa palavra.
2. **Caso 5 faltando** — "exatamente 22 parcelas valem `64815`". São doze casos, não treze.
3. **Caso 8 vai dar `FAILED`:** o `installments` monta `installment: value`, e a tarefa (e o
   próprio teste) pedem `amount_cents:`.
4. **`check_error` tem um `rescue` que não guarda o erro.** O segundo `rescue` não tem `=> e`,
   então dentro dele o `e` é `nil`. _Se o bloco lançar um `TypeError`, o que essa linha
   imprime?_
5. **Tarefa 1 (`irb`) não veio** — nem previsão, nem resultado, nem a coluna do JavaScript.
6. **A prova de estragar** (resto nas últimas parcelas) fica para depois dos itens 1 a 3.

**Perguntas em voz alta:**

- _1 (`each` × `map`)_ — **fecha, com complemento.** "`each` devolve o array original e `map`
  devolve o array modificado": a palavra certa é **novo** — o `map` não modifica nada; o
  original continua igual (quem modifica é o `map!`). O bug de usar `each` para montar a lista:
  a transformação é jogada fora em silêncio e volta a lista original.
- _2 (`{ number: 1 }["number"]`)_ — **fecha.** `{ number: 1 }` é `{ :number => 1 }`; símbolo e
  string são tipos diferentes, a chave não é encontrada, `nil`.

**Sobre a verificação por `grep`:** ela acusou três linhas — "should **return** exactly",
"should **return** one", "not enough cents **for** each". São palavras dentro das descrições,
não código: o `grep` que a aula propôs é grosseiro demais para texto em inglês. Falha da aula,
não do código; essas três estão aceitas.

**Uma pergunta sobre o registro acima.** O parágrafo antes desta revisão diz que as mensagens
dos testes "foram detalhadas" e que a sintaxe foi conferida com `ruby -c` numa sessão sem
Docker. Pelo [método](../como-ensinar.md#papéis), o código do projeto é escrito pelo João. _Quem
detalhou as mensagens?_ Se foi outro assistente, vale combinar que ele também só revisa.

Menores: indentação de 4 espaços (o Ruby usa 2); comentário em português dentro do código
(linha 31 — a [convenção](../convencoes.md#idiomas) pede inglês); `rest_cents` → `remainder` e
`installments_value` → `installment_base`; espaço depois da vírgula; linhas em branco sobrando
dentro dos métodos.
