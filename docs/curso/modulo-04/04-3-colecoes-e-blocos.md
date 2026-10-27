---
tipo: aula
modulo: 4
aula: "4.3"
status: concluida
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

**Status:** concluída em 24/10/2026 — ver [revisão 5](#revisão-5--24102026-fecha).

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

Em 24/10/2026, o RuboCop apontou `Layout/LineLength` no caso 8. A chamada de `check` foi
quebrada em três linhas, preservando a expressão e o comportamento.

Ao rodar o RuboCop no Windows, `01_divisao.rb` acusou `Layout/EndOfLine` porque o estilo padrão
nativo esperava `CRLF`, apesar de o projeto exigir `LF` em [`.gitattributes`](../../../.gitattributes).
O estilo `lf` foi declarado explicitamente em [`.rubocop.yml`](../../../.rubocop.yml); a
verificação específica do cop passou sem infrações.

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

### Revisão 2 — 24/10/2026: ponto de partida, não fecha

Sem entrega nova da 4.3 — é o estado da revisão 1 depois do RuboCop (`c6367c9`) e do rename
para `03_split_installments.rb` (`a947069`; o comando da Verificação acima usa o nome velho).
Agora no **container**:

```text
$ docker compose run --rm ruby ruby -w sandbox/modulo-04/03_split_installments.rb
FAILED, calibration: …                              ← esperado
OK, … exactly 27 installments
FAILED, the 27 installments should add up to …      ← caso 3
OK, … first … 64815 … last … 64814
OK, … [34, 33, 33]
OK, … [1]
FAILED, installments(1750000, 27).first …           ← caso 8
OK, … numbered 27
OK ×4 (casos 10 a 13)
```

Doze linhas, três `FAILED`, sem `warning`.

- **Item 1, caso 3:** o `TypeError` sumiu, mas o `map` virou `each`, e o caso falha em
  silêncio — o `each` devolve o próprio array, e array nunca é `== 1_750_000`. É o bug que o
  João descreveu certo na pergunta em voz alta 1, agora no código dele. O `sum = 0` / `sum +=`
  continua (regra 4).
- **Item 2, caso 5:** continua faltando.
- **Item 3, caso 8:** continua `installment:` no `installments`.
- **Item 4, `check_error`:** continua o `rescue StandardError` sem `=> e`; ali o `e` é `nil`,
  então imprimiria `FAILED, NilClass` — e sem a descrição.
- **Item 5, `irb`:** entregue depois, no mesmo dia — ver abaixo.
- **Menores:** indentação e comentário em português resolvidos pelo RuboCop; nomes
  (`rest_cents`, `installments_value`) e linhas em branco entre os `raise` continuam.

#### Tarefa 1 (`irb`) — entregue em 24/10, fecha com ressalva

As nove expressões vieram numa tabela com **resultado Ruby**, **equivalente JS** e **resultado
JS**. Os nove resultados Ruby estão certos, e os equivalentes em JS também — inclusive os dois
que divergem: `forEach` devolve `undefined` enquanto o `each` devolve o array (linha 2), e
`["amount"]` acha a chave no JS e dá `nil` no Ruby (linha 9).

Faltou a coluna de **previsão** — a parte que mostra onde a intuição de JS engana. Previsão
escrita depois de rodar não vale; no lugar dela, uma pergunta em voz alta: *por que a linha 9
diverge — o que é a chave `amount` em cada linguagem?*

### Revisão 3 — 24/10/2026: os itens 1 a 4 fecham

Árvore de trabalho, ainda sem commit. Verificado no container: **13 linhas**, só a calibração em
`FAILED`, sem `warning`; RuboCop limpo; o `grep` só pega `return` dentro de descrições (aceito
na revisão 1).

- **Caso 3:** `array_installments.sum == 17_500_00` — sem contador, sem `each`.
- **Caso 5:** `array_installments.count(648_15) == 22`.
- **Caso 8:** `amount_cents:` no `installments`.
- **`check_error`:** `rescue StandardError => e`.
- **Além do pedido:** `installment_base, remainder = total_cents.divmod(count)` — `divmod`
  devolve quociente e resto num par, desestruturado em duas variáveis. Resolve os nomes
  pedidos e tira as linhas em branco entre os `raise`.

Menores, sem bloquear: o `FAILED` do `rescue StandardError` perde a descrição do caso; a
descrição do caso 5 imprime `648_15` literalmente (o `_` é sintaxe do Ruby, não texto); a
mensagem *"total cents need to be positive"* — zero passa por esse `raise` (`0.negative?` é
`false`), então o certo é "não negativo"; e *"need to be"* → *"must be"*.

Falta: a prova de estragar (resto nas últimas parcelas), o commit `feat:` e a pergunta em voz
alta da linha 9 do `irb`.

### Revisão 4 — 24/10/2026: commit `d011270`, falta só o relato da prova

Commit `feat: implement installment splitting checks` (`d011270`). Verificado no container:
13 linhas, 12 `OK` + a calibração; RuboCop limpo no repositório. Os menores da revisão 3 também
vieram (descrição no `FAILED` do `StandardError`, *"must not be negative"*, `64815` sem `_` na
descrição).

**Prova de estragar:** o João disse "pronto, tudo certo", sem a lista. O Claude rodou a troca
(resto nas **últimas**) no container, sem alterar o arquivo, para ter o gabarito: falham os
casos **4, 6 e 8**; continuam `OK` o 3 (a soma não depende de onde o centavo vai), o 5 (continuam
22 parcelas de `64815`, só que no fim) e o 7 (`1 / 1` não tem resto). Pedido ao João: a lista e
o porquê dos três que não acusam.

**Pergunta da linha 9 do `irb`:** metade em 24/10. O lado Ruby está certo — `amount:` é atalho de
`:amount =>`, símbolo é único e imutável, símbolo ≠ string e o hash não converte. Faltou o lado
JS: lá a chave **é** a string `"amount"`, e `.amount` é só outra grafia de `["amount"]`.

### Revisão 5 — 24/10/2026: fecha

**Prova de estragar:** o relato bate com o gabarito da revisão 4 — caem 4, 6 e 8; ficam `OK`
2, 3, 5, 7, 9 e os quatro `check_error`, cada um com o porquê certo. A conclusão do João vale
registrar: *só os testes que olham a **posição** protegem a regra do centavo; tamanho, soma e
contagem protegem a conservação do total; `(1, 1)` não tem resto e é cego para a regra por
construção.*

**Pergunta da linha 9:** fecha. No JS a chave de `{ amount: 100 }` é a string `"amount"`, e
`.amount` / `["amount"]` são duas grafias da mesma chave; até `obj[1]` vira `"1"`.

> [!note] Complemento
> O `Symbol` do JS **não** é o símbolo do Ruby: cada `Symbol("amount")` cria um valor **novo** e
> diferente (`Symbol("a") === Symbol("a")` é `false`). O que se parece com o `:amount` do Ruby —
> um só objeto para o nome no programa inteiro — é o `Symbol.for("amount")`, do registro global.

**Fica de lição para o módulo:** linter limpo não é código certo (o `02` passou no RuboCop
quebrado), e teste `OK` não prova que protege — só a prova de estragar diz o quê.

Menores da revisão 1: indentação de 4 espaços (o Ruby usa 2); comentário em português dentro do código
(linha 31 — a [convenção](../convencoes.md#idiomas) pede inglês); `rest_cents` → `remainder` e
`installments_value` → `installment_base`; espaço depois da vírgula; linhas em branco sobrando
dentro dos métodos.
