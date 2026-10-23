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
  arrayParcelas.push(new Money(centavos(valorParcelaCentavos + (i < centavosRestantes ? 1 : 0))));
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

| Ruby | O que faz | JavaScript |
|---|---|---|
| `each { \|x\| … }` | percorre; **devolve a própria coleção** | `forEach` (devolve `undefined`) |
| `map { \|x\| … }` | transforma; devolve uma coleção nova | `map` |
| `select { \|x\| … }` / `reject` | filtra mantendo / tirando | `filter` |
| `find { \|x\| … }` | o primeiro que casa | `find` |
| `sum` | soma | `reduce((a, b) => a + b, 0)` |
| `count(valor)` / `count { \|x\| … }` | quantos | `filter(…).length` |
| `all? { … }` / `any? { … }` | todos / algum | `every` / `some` |
| `each_with_index { \|x, i\| … }` | percorre com o índice | `forEach((x, i) => …)` |
| `map.with_index(1) { \|x, n\| … }` | transforma com índice **começando em 1** | — |
| `n.times.map { \|i\| … }` | `0` a `n - 1`, transformado | `Array.from({ length: n }, (_, i) => …)` |

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

   | # | Caso |
   |---|---|
   | 1 | calibração: `check("calibração: deve imprimir FALHOU", false)` |
   | 2 | `split_installments(1750000, 27)` tem 27 parcelas |
   | 3 | e elas somam `1750000` |
   | 4 | a primeira é `64815` e a última é `64814` |
   | 5 | exatamente 22 parcelas valem `64815` |
   | 6 | `split_installments(100, 3)` é `[34, 33, 33]` |
   | 7 | `split_installments(1, 1)` é `[1]` |
   | 8 | `installments(1750000, 27).first` é `{ number: 1, amount_cents: 64815 }` |
   | 9 | `installments(1750000, 27).last[:number]` é `27` |
   | 10 | `count` igual a `0` lança `ArgumentError` |
   | 11 | `count` igual a `2.5` lança `ArgumentError` |
   | 12 | `total_cents` igual a `-1` lança `ArgumentError` |
   | 13 | `5` centavos em `10` parcelas lança `ArgumentError` |

4. **Regras:** nenhum `for`, nenhum `while`, nenhum contador manual (`i += 1`), nenhum `return`,
   nenhum `Float`, nenhum `<<` dentro de `each` para montar a lista. Nomes em inglês, *snake_case*.
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

_(a preencher)_
