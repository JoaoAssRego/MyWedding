---
tipo: aula
modulo: 4
aula: "4.4"
status: concluida
conceitos:
  - classe
  - initialize
  - attr-reader
  - metodo-de-classe
  - operador-como-metodo
  - comparable
  - modulo-mixin
  - freeze
  - igualdade
tags:
  - curso/aula
  - curso/modulo-04
---

# Aula 4.4 — Classes, `Comparable` e `freeze`: o `Money` em Ruby

**Status:** concluída em 26/10/2026, na segunda revisão.

## Contexto

Até a 4.3 o Ruby do projeto foi feito de **métodos soltos**: `split_installments` recebe um
inteiro e devolve inteiros. Mas o valor de um contrato não é "um inteiro qualquer". No TypeScript
ele virou o [`Money`](../../../sandbox/modulo-01/money/money.ts) da
[aula 2.6](../modulo-02/02-6-money-value-object.md), um *value object*:

- construtor `private` e uma fábrica `Money.deCentavos`, que passa pela validação de `centavos()`
  (inteiro, maior ou igual a zero);
- `#centavos` privado, sem *setter*. Ninguém altera um `Money`: `somar` e `subtrair` devolvem
  um **novo**;
- `igualA` e `maiorQue` escritos à mão, porque `===` entre dois objetos compara identidade;
- `dividirEmParcelas`, `formatar` (`R$ 17.500,00`) e `toJSON`/`deJSON`.

A 4.3 terminou numa pergunta: *este método devolve um novo ou altera o que existe?* Um value
object é a resposta levada até o fim: **nenhum** método altera. Esta aula porta o `Money`, e o
Ruby tem peças prontas para metade do que o TS precisou escrever à mão.

## Teoria

O exemplo é de outro domínio, de propósito: uma **duração**, guardada em segundos inteiros.

### Classe, `initialize` e `@variável`

```ruby
# A length of time, stored as whole seconds.
class Duration
  attr_reader :seconds

  def initialize(seconds)
    @seconds = seconds
  end
end

d = Duration.new(90)
d.seconds   # => 90
```

| TypeScript | Ruby |
|---|---|
| `constructor(s) { this.#s = s }` | `def initialize(seconds)` + `@seconds = seconds` |
| `#seconds` (campo privado) | `@seconds`: **toda** variável de instância já é privada |
| `get seconds() { … }` / `getSeconds()` | `attr_reader :seconds` gera o método `seconds` |
| `new Duration(90)` | `Duration.new(90)`: `new` é um método da classe, que chama o `initialize` |

O comentário em cima da classe não é enfeite: o cop `Style/Documentation` do RuboCop pede uma
linha dizendo o que a classe representa.

Não existe `@seconds` público. De fora, o único acesso é por método, e o `attr_reader` só
escreve esse método para você. Os primos dele, `attr_writer` e `attr_accessor`, geram o
*setter*, e por isso não entram num value object. Isso fecha uma pendência do módulo 2: em
Ruby, getter é `attr_reader :id`, nunca `get_id`.

### Método de classe e o `new` privado

```ruby
class Duration
  def self.from_seconds(seconds)
    new(seconds)
  end

  def self.from_minutes(minutes)
    new(minutes * 60)
  end

  private_class_method :new
end

Duration.from_minutes(2)   # funciona
Duration.new(120)          # NoMethodError: private method 'new' called
```

O `def self.` é o `static` do TS. O `private_class_method :new` é o `private constructor`: fora
da classe só resta a fábrica. Dentro dela, `new(...)` sem receptor explícito continua permitido.

> [!warning] O privado do Ruby é um aviso, não uma tranca
> `Duration.send(:new, -5)` fura o `private`. O Ruby confia no programador. O que protege de
> verdade é a **validação dentro do `initialize`**: qualquer caminho que crie um objeto passa
> por ela.

### Operador é método

`a + b` é açúcar para `a.+(b)`, exatamente como a 4.2 mostrou com `1 + 2` e `1.+(2)`. Então
somar durações é definir um método chamado `+`:

```ruby
def +(other)
  Duration.from_seconds(seconds + other.seconds)
end
```

O método devolve uma `Duration` **nova** e não toca em `self`. O TS precisou de um nome
(`somar`) porque não tem sobrecarga de operador. Em Ruby, `total = a + b + c` funciona, e
`[a, b, c].sum(Duration.from_seconds(0))` também, porque o `sum` só chama `+`.

Repare que o `+` cria o resultado **pela fábrica**, e por isso a validação roda de novo também
nesse caminho.

### `Comparable`: um módulo que você inclui

No TS você escreveu `igualA` e `maiorQue`. Em Ruby você escreve **um** método, o `<=>` (a
"nave espacial"), e inclui o módulo `Comparable`:

```ruby
class Duration
  include Comparable

  def <=>(other)
    seconds <=> other.seconds if other.is_a?(Duration)
  end
end
```

O `<=>` devolve `-1`, `0` ou `1` (menor, igual, maior), ou `nil` quando não dá para comparar. É o
mesmo contrato da função que o `Array.prototype.sort` do JS recebe. Com ele, o `Comparable`
entrega `<`, `<=`, `==`, `>`, `>=`, `between?` e `clamp`. E o `sort`, o `min` e o `max` de
qualquer array dessas durações passam a funcionar.

O `if other.is_a?(Duration)` não está ali por acaso. Sem ele, `duration == 5` chamaria
`5.seconds` e quebraria. Com ele, o `<=>` devolve `nil`, e o `==` do `Comparable` responde
`false`.

O `Comparable` é um **módulo**: um pacote de métodos sem classe própria, que entra em uma
classe pelo `include` (um *mixin*). A coisa mais próxima no TS seria uma `interface` que, além
de exigir um método, também **entregasse** a implementação dos outros. O `Enumerable` da 4.3 é
o mesmo truque: o `Array` define o `each` e ganha `map`, `select` e `sum` de graça.

### `freeze`

```ruby
def initialize(seconds)
  raise ArgumentError, 'seconds must be a non-negative Integer' unless seconds.is_a?(Integer) && !seconds.negative?

  @seconds = seconds
  freeze
end
```

O `freeze` é o `Object.freeze` do JS: depois dele, qualquer tentativa de alterar o objeto lança
`FrozenError`. Ele vem **por último** porque o `@seconds = ...` também é uma alteração. É
raso, como no JS: congela o objeto, não o que ele aponta. Com um `Integer` dentro, não há o que
vazar.

Se o `@seconds` já é privado e não existe *setter*, para que congelar? Porque uma classe pode
ganhar mais métodos depois, e o `freeze` transforma "ninguém altera, por enquanto" em "ninguém
altera, garantido". É a mesma conversa do `frozen_string_literal` da aula passada.

### Três igualdades

| Ruby | Pergunta | JS |
|---|---|---|
| `a.equal?(b)` | é o **mesmo** objeto? | `a === b` entre objetos |
| `a == b` | tem o mesmo **valor**? (o seu `<=>` responde) | não existe; por isso o `igualA` |
| `a.eql?(b)` + `a.hash` | valem como a **mesma chave** de Hash? | não existe |

Um `Hash` e o `uniq` não usam o `==`. Eles usam o `hash` para achar o "balde" da chave e o
`eql?` para confirmar. Sem os dois, duas durações de 90 segundos são chaves **diferentes**:

```ruby
def eql?(other)
  other.is_a?(Duration) && seconds == other.seconds
end

def hash
  [Duration, seconds].hash
end
```

Regra de value object: **se o `==` diz que são iguais, o `eql?` e o `hash` têm que concordar.**

### `to_s`

O `puts` e a interpolação `"#{d}"` chamam o `to_s`. Já o `p` e o `irb` chamam o `inspect`.

```ruby
def to_s
  hours, minutes = (seconds / 60).divmod(60)
  format('%<hours>dh %<minutes>02dmin', hours: hours, minutes: minutes)   # "1h 05min"
end
```

O `%02d` preenche com zero à esquerda, o mesmo `padStart(2, "0")` do JS. O formato com nomes
(`%<minutes>02d`) é o que o RuboCop prefere.

## Tarefa

1. **`sandbox/modulo-04/04_money.rb`**, com a classe `Money`:
   - `Money.from_cents(cents)` é a **única** forma de criar um `Money`. O `new` fica privado.
     Lança `ArgumentError` se `cents` não for `Integer` ou for negativo. Antes de escrever, olhe
     o `centavos()` do TS.
   - `attr_reader :cents`, e nenhum outro acesso ao valor.
   - `+` e `-` devolvem um `Money` novo. `-` abaixo de zero lança `ArgumentError`, mantendo o
     comportamento do TS (a pendência *"`Money` pode ser negativo?"* continua aberta).
   - `include Comparable` e `<=>`, que devolve `nil` para o que não for `Money`.
   - `eql?` e `hash` coerentes com o `==`.
   - `split(count)` devolve um **array de `Money`**, com a regra da 4.3 (resto distribuído nas
     primeiras parcelas, `divmod`, sem `for`) e as mesmas validações de `count`.
   - `to_s`, no formato do `formatar` do TS: `R$ 17.500,00`, `R$ 2.916,67`, `R$ 0,05`. Sem
     `Float`: reais e centavos saem do `divmod` por 100. O ponto de milhar é a parte nova. Há
     uma solução com `reverse`, `scan(/\d{1,3}/)` e `join`, e outra com `gsub` e regex.
   - o objeto termina congelado.

2. **Os casos**, com o `check` e o `check_error` da 4.3 copiados para o arquivo (na 4.5 eles
   dão lugar ao Minitest). Use `total = Money.from_cents(1_750_000)` onde couber.

   | # | Caso |
   |---|---|
   | 1 | calibração: deve imprimir `FAILED` |
   | 2 | `Money.from_cents(1_750_000).cents` é `1_750_000` |
   | 3 | `Money.respond_to?(:new)` é `false` |
   | 4 | `from_cents(-1)` lança `ArgumentError` |
   | 5 | `from_cents(10.5)` lança `ArgumentError` |
   | 6 | `a + b` vale 30 (com `a` = 10 e `b` = 20) **e** `a.cents` continua 10 |
   | 7 | `b - a` vale 10 |
   | 8 | `a - b` lança `ArgumentError` |
   | 9 | `b > a` e `a < b` |
   | 10 | dois `from_cents(10)` são `==`, mas **não** são `equal?` |
   | 11 | `from_cents(10) == 10` é `false`, sem erro |
   | 12 | `[from_cents(10), from_cents(10)].uniq.size` é `1` |
   | 13 | `[c, a, b].sort == [a, b, c]` e `[c, a, b].max == c` (com `c` = 30) |
   | 14 | o objeto está `frozen?` |
   | 15 | `total.split(27)` tem 27 elementos, todos `Money` (`all?`) |
   | 16 | e somam `total` (`sum`, com o valor inicial certo) |
   | 17 | a primeira vale 64815 e a última 64814 |
   | 18 | `split(0)` e `split(2.5)` lançam `ArgumentError` |
   | 19 | `from_cents(5).split(10)` lança `ArgumentError` |
   | 20 | `to_s` de 1_750_000, 291_667 e 5: `R$ 17.500,00`, `R$ 2.916,67`, `R$ 0,05` |

3. **Regras:** sem `attr_writer`, `attr_accessor` e `instance_variable_get`/`set`. Sem `Float`
   (`to_f`, `/ 100.0`). Sem `for`, `while` e `return`. Nenhum método altera `self`. Nomes em
   inglês, *snake_case*.

4. **Prova de estragar**, depois de tudo `OK`:
   - comente o `include Comparable` e rode. Quais casos caem, e **com que erro**? Algum caso
     continua `OK`? Explique por quê;
   - tire o `freeze` e, no `irb` do container, rode `m.instance_variable_set(:@cents, 0)` com e
     sem ele. Qual caso da tabela percebe a diferença?

   Desfaça as duas trocas.

5. **Rodar a verificação antes do commit.** Commit `feat:`, assunto no imperativo.

## Verificação

```bash
docker compose run --rm ruby ruby -w sandbox/modulo-04/04_money.rb
```

Vinte linhas: a primeira `FAILED` (a calibração), as outras dezenove `OK`. Nenhum `warning`.

```bash
docker compose run --rm ruby bundle exec rubocop
```

`no offenses detected`, no repositório inteiro.

```bash
docker compose run --rm ruby grep -nE "attr_(writer|accessor)|instance_variable_[gs]et|to_f|100\.0|\bwhile\b|\breturn\b" sandbox/modulo-04/04_money.rb
```

Nenhuma linha. O `for` ficou fora desse `grep` de propósito, porque ele pegava texto das
descrições na 4.3. Esse confira de olho.

## Perguntas para responder em voz alta

1. **`==`, `eql?` e `equal?`: o que cada um pergunta? Qual deles o `Hash` usa, e o que daria
   errado num `Hash` com chaves `Money` sem o `hash`?**
2. **Onde está o `raise` do `-` abaixo de zero?** Se você não escreveu um `raise` no `-`,
   explique quem lança o erro. Se escreveu, ele precisava existir?
3. **Por que o `<=>` devolve `nil` para o que não é `Money`, em vez de lançar um erro?**

## Pendências herdadas

- **`Money` pode ser negativo?** O port mantém: `-` abaixo de zero lança. A resposta vem no
  módulo 6, com o `CHECK` da coluna.
- `toJSON`/`deJSON` do TS ficam para o Rails (módulo 5), que tem o próprio caminho de
  serialização.

## O que aconteceu

### 25/10/2026: antes da revisão

Registro de outra sessão, mantido como estava. Em 25/10/2026, o RuboCop apontou
`Style/FrozenStringLiteralComment` em `sandbox/modulo-04/04_money.rb`, e o arquivo recebeu
`# frozen_string_literal: true` na primeira linha. Na mesma data, os 20 casos da tarefa foram
escritos no arquivo, com descrições explícitas em cada `check` e `check_error`. A execução ficou
bloqueada em `Integer?`, e o erro foi mantido visível para a revisão.

### Revisão 1 — 26/10/2026: não fecha

Commit `c85c41d` (*"test: creation of tests to Class Money"*), com a classe e os casos juntos.
No container, o script **não passa da linha 90**:

```text
$ docker compose run --rm ruby ruby -w sandbox/modulo-04/04_money.rb
FAILED, calibration: …
04_money.rb:10:in 'Money.from_cents': undefined method 'Integer?' for an instance of Integer (NoMethodError)
Did you mean?  integer?
```

Corrigindo só esse nome, por diagnóstico e sem tocar no arquivo, o próximo erro aparece na
mesma linha:

```text
-:13:in 'BasicObject#initialize': wrong number of arguments (given 1, expected 0) (ArgumentError)
```

A classe **não tem `initialize`**. O `new(cents)` cai no `initialize` herdado, que não recebe
argumento, e não existe `@cents`. Nenhum `Money` jamais foi criado. A verificação não rodou
antes do commit, e o RuboCop passou limpo de novo: lint não executa código.

> [!warning] `ArgumentError` pelo motivo errado
> Esse `ArgumentError` de aridade é o **mesmo tipo** que o `check_error` espera. Com o
> `initialize` faltando, casos como "`a - b` lança `ArgumentError`" passariam `OK` sem testar
> nada. É o `@ts-expect-error` da [aula 2.6](../modulo-02/02-6-money-value-object.md), que
> aceitava qualquer erro. Ver o erro antes de confiar nele.

**O que impede de fechar:**

1. `cents.Integer?` não existe (o método é `integer?`, ou `is_a?(Integer)` como na 4.3).
2. Falta o `initialize`: guardar `@cents` e o `freeze`. Sem ele, o caso 14 também falha.
3. A validação mora no `from_cents`, não no `initialize`. A teoria avisou que
   `Money.send(:new, -5)` fura o `private`, e por isso a validação vai onde **todo** `Money`
   nasce.
4. `split` devolve hashes `{ number:, amount_cents: }`, numerados a partir de **0**, e a tarefa
   pede um array de `Money`. Os casos 15 a 17 dependem disso: `parts.sum(Money…)` quebraria
   ao somar um `Hash`.
5. `to_s`: `valor` não existe (`NameError`), e `format('%.2f', …)` é formatação de `Float`, que
   a regra 3 proíbe. Nomes e comentário em português (`numero_formatado`, *"Inverte ponto por
   vírgula"*), contra a [convenção](../convencoes.md#idiomas). A ideia do
   `reverse` + `gsub(/(\d{3})(?=\d)/, '\1.')` está boa e pode ficar.
6. `-`: o `raise` de `other.cents.negative?` é uma guarda que nunca dispara, porque um `Money`
   negativo não existe. O outro `raise` é a pergunta 2.
7. `validate_count!` está público e deveria ser `private`.
8. Prova de estragar não veio.
9. Commit: `test:` com assunto *"creation of …"*. Isso é `feat:` e o imperativo
   (*"add Money value object"*).

Menores: o comentário da classe (*"Creation of money on class"*) não diz o que ela representa;
o `split(0)` e o `split(2.5)` viraram dois casos, então a saída esperada passa a ter 21 linhas,
o que está aceito.

**Perguntas em voz alta:**

- *1 (`==`, `eql?`, `equal?`)*: **fecha.** Os exemplos com `1 == 1.0` e `1.eql?(1.0)` são
  precisos, e a conclusão também: o `Comparable` sozinho não serve para chave de `Hash`.
- *2 (onde está o `raise` do `-`)*: **a resposta descreve o desenho certo, mas não o código
  entregue.** Ela diz que a validação está no `initialize` e que o `-` chama `Money.new`. No
  arquivo, não existe `initialize`, o `-` chama `from_cents` e tem dois `raise` próprios. Volta
  depois do conserto, explicada a partir do código.
- *3 (`<=>` devolve `nil`)*: **fecha.** `==` responde `false`, e `<`/`sort` lançam
  `ArgumentError (comparison of Money with Integer failed)`.

### Entre as revisões — 26/10/2026: `new`, `initialize` e `freeze`

Registro de outra sessão, mantido como estava.

As perguntas sobre a criação de `Money` fecharam com três ajustes de precisão:

1. `private_class_method :new` torna o método de classe `new` privado. Portanto,
   `Money.new(1)` não pode ser chamado de fora e lança `NoMethodError`; dentro de um método da
   própria classe, `new(cents)` continua permitido. `Money.from_cents` é a fábrica pública.
2. `from_cents` chama `new(cents)`, e o `new` chama `initialize(cents)` automaticamente. É o
   `initialize` que valida, guarda `@cents` e congela o objeto. A fábrica não recebe o valor no
   atributo por conta própria.
3. `freeze` é o equivalente ao `Object.freeze` do JavaScript: depois dele, tentar alterar o
   objeto lança `FrozenError`. Ele precisa vir depois de `@cents = cents`, porque essa atribuição
   ainda é uma alteração. O congelamento é raso; neste caso o atributo é um `Integer`, portanto
   não há uma estrutura interna mutável para escapar.

O caso `Money` continua exigindo os dois mecanismos: `attr_reader` não cria setter, mas `freeze`
garante a imutabilidade mesmo se outro método que altere estado for adicionado à classe depois.

### Revisão 2 — 26/10/2026: fecha

Commits `deceb40` (*"feat: implement Money value object"*) e `ee0051a` (*"feat: format Money as
currency"*). Verificado no container: **21 linhas**, só a calibração em `FAILED`, sem `warning`;
RuboCop limpo no repositório; o `grep` de regras só pega `for` dentro de descrições.

Os nove itens da revisão 1 foram resolvidos:

- `initialize` valida (`is_a?(Integer) && !cents.negative?`), guarda `@cents` e termina em
  `freeze`; `from_cents` só chama `new`. Agora a validação está no lugar por onde **todo**
  `Money` passa;
- `split` devolve `Money`, criados pela fábrica; `validate_count!` foi para `private`;
- `to_s` sem `Float`: `cents.divmod(100)`, o `reverse` + `gsub` mantido, e `rjust(2, '0')`
  para os centavos;
- `-` sem a guarda que nunca disparava;
- commits `feat:` no imperativo. O `c85c41d` fica como está no histórico.

**Prova de estragar:** o relato bate com o que o Claude rodou no container.

- Sem `include Comparable`, o script morre no caso 9 com
  `NoMethodError: undefined method '>' for an instance of Money`, **fora** do `check`. Tirando
  esse caso, caem só o "`==` mas não `equal?`" e a soma das parcelas, porque o `==` volta a ser
  o de `Object` (identidade). `sort` e `max` continuam `OK` porque chamam o `<=>` direto, e o
  `uniq` também, porque usa `hash`/`eql?`. O "não é `==` a um `Integer`" continua `OK` **por
  acaso**, já que a identidade também dá `false`. Esse detalhe foi o João quem notou.
- Sem `freeze`, o `instance_variable_set(:@cents, 0)` altera o objeto mesmo sem *setter*. Só o
  caso 14 percebe.

**Pergunta 2, refeita a partir do código:** fecha. O `raise` que garante a regra está no
`initialize`; o do `-` ficou só pela mensagem mais clara (*"Result Money can't be negative"* em
vez da mensagem genérica de construção), exatamente como a primeira resposta dizia.

Menor, sem bloquear: *"Count need to be"* voltou (na 4.3 tinha virado *"must be"*).

> [!question] Quem escreveu o código e os casos?
> Os dois commits que consertam a classe trazem `Co-authored-by: Copilot`. Pelo
> [método](../como-ensinar.md#papéis), o código do projeto é escrito pelo João. O relato da prova
> de estragar mostra que ele entende o que foi entregue, e por isso a aula fecha. Fica a
> pergunta, que já tinha aparecido na revisão 1 da 4.3: **o que o Copilot escreveu?** Se foi
> autocomplete de linha, tudo bem. Se foi o `initialize` ou o `to_s` inteiros, esse é o trecho
> a ser escrito de novo, de próprio punho. O registro de 25/10 acima também diz que os 20 casos
> "foram escritos" numa sessão separada. Vale a mesma pergunta para eles.

**Resposta do João, 26/10:** o Copilot só escreve as **mensagens de commit**, e o João valida
cada uma antes de commitar. O código é dele. A dúvida está respondida. O trailer
`Co-authored-by: Copilot`, porém, afirma coautoria do conteúdo do commit e não só da mensagem.
Fica a sugestão de tirá-lo nos próximos commits, para o histórico dizer o que aconteceu.
