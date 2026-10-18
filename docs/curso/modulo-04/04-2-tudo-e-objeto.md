---
tipo: aula
modulo: 4
aula: "4.2"
status: concluida
conceitos:
  - objeto-e-metodo
  - snake-case
  - truthiness
  - nil
  - simbolo
  - metodos-com-interrogacao-e-exclamacao
  - def
tags:
  - curso/aula
  - curso/modulo-04
---

# Aula 4.2 — Tudo é objeto: `nil`, símbolos, *truthiness* e métodos com `?` e `!`

**Status:** concluída em 18/10/2026, na quarta revisão.

## Contexto

A [aula 4.1](04-1-ruby-em-docker.md) deixou o Ruby rodando no container e o primeiro script, o
`01-divisao.rb`. No `irb` apareceram duas pistas do assunto de hoje: `1.class` é `Integer` e
`nil.class` é `NilClass` — o número e o "nada" têm classe. E a revisão deixou uma pendência de
estilo: `valorFornecedor` e `numeroParcelas` são nomes de JavaScript.

Esta aula é sobre o que muda na cabeça de quem vem do JavaScript: o que é objeto, o que é
falso, o que é "nada", e como os nomes contam o que um método faz. Tudo cabe no domínio numa
pergunta que o projeto vai responder muitas vezes: **esta parcela está paga?**

## Teoria

### Tudo é objeto — inclusive o operador

No JavaScript, `5` e `null` são *primitivos*: não são objetos (o `(5).toFixed()` funciona porque
o JS embrulha o número num objeto por um instante). No Ruby não há primitivo. `5` é um objeto da
classe `Integer`, `nil` é o único objeto da classe `NilClass`, e todo valor responde a métodos:

```ruby
# exemplo em outro domínio, de propósito: estoque de uma livraria
estoque = 0
estoque.zero?        # => true
-3.abs               # => 3
7.between?(1, 10)    # => true
```

Até o `+` é método: `2 + 3` é açúcar para `2.+(3)`. Por isso `"parcela " + 1` deu `TypeError`
na 4.1 — o método `+` da `String` só aceita outra `String`, e o Ruby **não converte sozinho**
como o JavaScript faz. Para juntar texto e número, converta de propósito (`1.to_s`) ou use
interpolação: `"parcela #{numero}"`.

Parênteses em chamada são opcionais: `puts "oi"` é `puts("oi")`. A regra prática: omita quando
não há argumento ou quando a linha fica óbvia; use quando houver ambiguidade.

### Nomes

| Coisa | Estilo | Exemplo |
|---|---|---|
| variável, método | *snake_case* | `total_cents`, `installment_status` |
| classe, módulo | *CamelCase* | `Money`, `Contract` |
| constante | MAIÚSCULAS | `MAX_INSTALLMENTS = 48` |

Não é só gosto: nome começado por letra maiúscula **é** constante para o Ruby, e reatribuir
uma gera aviso. E, desde a [troca para Rails](../00-plano-de-estudos.md#mudança-de-rota-10102026),
o domínio é escrito em inglês ([convenções](../convencoes.md#idiomas)).

### O que é falso

| Valor | JavaScript | Ruby |
|---|---|---|
| `false` | falso | falso |
| `null` / `nil` | falso | falso |
| `undefined` | falso | não existe |
| `0` | **falso** | **verdadeiro** |
| `""` | **falso** | **verdadeiro** |
| `NaN` | falso | — |
| `[]`, `{}` | verdadeiro | verdadeiro |

No Ruby, **só `false` e `nil` são falsos**. Todo o resto — `0` inclusive — é verdadeiro. Para
quem lida com centavos é uma boa notícia: `if valor` não confunde "zero" com "não informado",
coisa que no JavaScript já derrubou muito sistema. A pergunta "é zero?" se faz com `zero?`; a
pergunta "existe?" se faz com `nil?`.

### `nil`: um só "nada", e ele é objeto

O JavaScript tem dois "nadas" (`null` e `undefined`); o Ruby tem um. Ele aparece onde o JS
devolveria `undefined`:

```ruby
livros = ["Dom Casmurro", "Iracema"]
livros[5]          # => nil — silêncio, como o undefined
livros.fetch(5)    # => IndexError: index 5 outside of array bounds
```

`fetch` é a versão que **reclama**. Lembra a pendência do módulo 2, o `if (parc[0] && parc[5])`
que pulava o teste em silêncio quando o array vinha curto? Em Ruby a ferramenta para não cair
nisso tem nome.

Como `nil` é objeto, ele também tem métodos: `nil.to_s` é `""`, `nil.to_a` é `[]`, `nil.nil?` é
`true`. E o `?.` do JavaScript existe com outra grafia: `livro&.titulo` devolve `nil` em vez de
quebrar se `livro` for `nil`.

Um último lugar onde `nil` aparece: **todo método devolve alguma coisa**. O `puts` imprime e
devolve `nil` — por isso o `irb` mostra `=> nil` depois de cada `puts`.

### `p` × `puts`

`puts` mostra o valor para gente ler; `p` mostra o valor como ele é, para depurar:

```ruby
puts nil       # (linha em branco)
p nil          # nil
puts "Iracema" # Iracema
p "Iracema"    # "Iracema"
```

Na depuração, use `p` — o `puts` esconde exatamente a diferença entre `nil` e `""`.

### Símbolos

```ruby
situacao = :emprestado
```

Um símbolo é um **nome**: imutável, e o mesmo objeto toda vez que é escrito. Duas strings
`"emprestado"` iguais são dois objetos; dois `:emprestado` são um só. Símbolo é para o que
**identifica** (um estado, uma chave, uma opção); string é para o que é **texto** (o nome de um
livro, uma mensagem para o usuário).

A comparação com o que você já fez: o tipo `type Situacao = "emprestado" | "devolvido"` do
TypeScript era uma união de strings fazendo papel de nome. Em Ruby, esse papel é do símbolo.

### Métodos com `?` e `!`

Convenção que o Ruby inteiro segue, e que lê como frase:

- **`?` no fim — pergunta, devolve verdadeiro ou falso:** `zero?`, `nil?`, `empty?`, `even?`.
- **`!` no fim — versão "perigosa"** de um método que existe também sem `!`. Quase sempre:
  **altera o próprio objeto** em vez de devolver um novo.

```ruby
titulo = "iracema"
titulo.capitalize    # => "Iracema" — devolve um novo; titulo continua "iracema"
titulo.capitalize!   # altera titulo
```

Você conhece essa diferença: é a mesma entre o `somar` do `Money`, que devolve um `Money` novo,
e um método que mudasse o próprio valor. Por isso o `Money` em Ruby (aula 4.4) não vai ter
nenhum método com `!`.

E uma novidade do Ruby 4.0: alterar uma string escrita literalmente no código já gera aviso —
*"literal string will be frozen in the future"*. As strings literais vão virar imutáveis; o
assunto volta na 4.4, com `freeze`.

### Definindo um método

```ruby
def loan_status(days_late)
  if days_late.zero?
    :on_time
  elsif days_late <= 7
    :late
  else
    :overdue
  end
end

p loan_status(0)    # :on_time
p loan_status(10)   # :overdue
```

- `def … end` define; não há chaves.
- **Não precisa de `return`**: o método devolve o valor da última expressão avaliada — e o
  `if` inteiro é uma expressão.
- Erro se lança com `raise` (o `throw` do JS) e se captura com `begin … rescue … end` (o
  `try/catch`):

```ruby
def lend(copies)
  raise ArgumentError, "sem exemplares" if copies.zero?
  copies - 1
end

begin
  lend(0)
rescue ArgumentError => e
  p e.class      # ArgumentError
  p e.message    # "sem exemplares"
end
```

Repare no `raise … if …` numa linha só: em Ruby, `if` pode vir **depois** da frase, quando ela
é curta. Lê como se fala.

## Tarefa

1. **Pendência da 4.1:** renomear as variáveis do `01-divisao.rb` para *snake_case*, em inglês,
   e fazer a prova comparar com a variável do total, não com o número digitado. A saída não
   pode mudar. Commit próprio, tipo `refactor:`.
2. **`irb` com previsão**, como na 4.1 — agora com três colunas: **previsão**, **resultado** e
   **o que o JavaScript daria**.

   ```ruby
   1.+(2)
   empty_text = ""
   empty_text ? "truthy" : "falsy"
   0 ? "truthy" : "falsy"
   nil.to_a
   [10, 20, 30][5]
   [10, 20, 30].fetch(5)
   :paid.object_id == :paid.object_id
   "paid".object_id == "paid".object_id
   x = puts("oi")
   x
   ```

3. **`sandbox/modulo-04/02-installment-status.rb`**, com dois métodos:
   - `installment_status(paid_cents, amount_cents)` devolve `:pending`, `:partial` ou `:paid`.
     `paid_cents` pode vir `nil` (nenhum pagamento registrado) e deve ser tratado como zero.
     Pagamento **acima** do valor da parcela lança `ArgumentError`.
   - `paid?(paid_cents, amount_cents)` devolve `true` ou `false`, **usando** o primeiro método
     em vez de repetir a regra.

   No fim do arquivo, imprima com `p` estes casos, nesta ordem, para uma parcela de `64815`
   centavos:

   | `paid_cents` | Esperado |
   |---|---|
   | `nil` | `:pending` |
   | `0` | `:pending` |
   | `30000` | `:partial` |
   | `64815` | `:paid` |
   | `paid?` com `64815` | `true` |
   | `paid?` com `30000` | `false` |
   | `70000` | `ArgumentError`, capturado com `rescue` e impresso com `p` (a classe) |

   Regras: sem `return` explícito, sem nenhum `Float`, métodos com nome em *snake_case*.
4. Commit `feat:` para o script novo, assunto no imperativo e em inglês.

## Verificação

```bash
docker compose run --rm ruby ruby -w sandbox/modulo-04/01-divisao.rb
```

Continua `64814`, `22`, `true`, sem aviso.

```bash
docker compose run --rm ruby ruby -w sandbox/modulo-04/02-installment-status.rb
```

```text
:pending
:pending
:partial
:paid
true
false
ArgumentError
```

Sem nenhuma linha de `warning`. E a prova de que o `nil` é tratado de propósito: troque, por um
instante, o tratamento do `nil` por nada — rode e veja o que quebra, e com que erro. Desfaça.

Perguntas para responder em voz alta:

1. **No JavaScript, `if (valorPago)` e `if (parcelas[5])` escondem bugs. Qual dos dois o Ruby
   resolve sozinho, qual ele não resolve — e o que você usa no lugar?**
2. **Por que o status da parcela é `:paid` e não `"paid"`?**

## O que aconteceu

### Revisão 1 — 17/10/2026: não fecha

Commit `33d0e2a` (renomeação do `01-divisao.rb`); `02-installment-status.rb` ainda fora do Git,
salvo com `CRLF` (`i/ w/crlf attr/text eol=lf`).

**Verificação, no container:**

```text
$ docker compose run --rm ruby ruby -w sandbox/modulo-04/01-divisao.rb
64814
22
true
$ docker compose run --rm ruby ruby -w sandbox/modulo-04/02-installment-status.rb
:pending
:pending
:partial
:paid
true
false
ArgumentError
```

Saída exatamente a esperada, sem `warning`. No script: `paid_cents ||= 0` para o `nil` (a forma
idiomática), `raise … if …` numa linha, `paid?` reaproveitando `installment_status`, nenhum
`return`, nenhum `Float`.

**Tarefa 2 — `irb`:**

| Expressão | Previsão | Resultado | JavaScript |
|---|---|---|---|
| `1.+(2)` | `3` | `3` | `1.+(2)` não existe; `+` é operador, não método |
| `empty_text ? "truthy" : "falsy"` | `truthy` | `"truthy"` | `"falsy"` — `""` é falso no JS |
| `0 ? "truthy" : "falsy"` | `truthy` | *(não rodado)* | `"falsy"` |
| `nil.to_a` | não sei | `[]` | `null` não tem métodos: `TypeError` |
| `[10, 20, 30][5]` | `nil` | `nil` | `undefined` |
| `[10, 20, 30].fetch(5)` | não sei | `IndexError` | não há equivalente; o JS sempre devolve `undefined` |
| `:paid.object_id == :paid.object_id` | `true` | `true` | — |
| `"paid".object_id == "paid".object_id` | **`true`** | **`false`** | — |
| `x = puts("oi")` / `x` | **`oi`** / **`oi`** | `oi`, depois `=> nil` | `console.log` também devolve `undefined` |

As duas previsões erradas são as que valem a aula: duas strings iguais são **dois objetos**
(o símbolo é um só), e `puts` **imprime** `oi` mas **devolve** `nil`. A coluna do JavaScript,
pedida pela segunda vez, não veio — está acima.

> [!warning] O `irb` rodou no Ruby do Windows, não no container
> O rastro do `IndexError` mostra `C:/Ruby40-x64/lib/ruby/...`: existe um Ruby 4.0.7
> instalado direto no Windows (`x64-mingw-ucrt`), e foi ele que respondeu. A
> [convenção](../convencoes.md#ruby-roda-no-container) diz que Ruby roda no container — a
> mesma versão, mas outro sistema operacional, e é no Windows nativo que gems com código C (o
> driver do Postgres, no módulo 5) costumam dar trabalho. Decisão pendente do João: desinstalar
> e voltar ao container, ou mudar a convenção de propósito e registrar o porquê.

**O que impede de fechar:**

1. **Script não commitado** (tarefa 4).
2. **Renomeação em português.** `valor_fornecedor`, `numero_parcelas` estão em *snake_case*,
   mas a tarefa 1 pedia inglês — a [convenção](../convencoes.md#idiomas) do módulo 4 em
   diante.
3. **A prova do `nil`** (tirar o `||= 0`, rodar, ver o erro, desfazer) não foi relatada.
4. **Pergunta 1 — não fecha; a resposta inverteu os dois casos.** No Ruby, `parcelas[5]` fora
   do array devolve `nil`, e `nil` é falso: `if parcelas[5]` **pula em silêncio, igual ao
   JavaScript** — o Ruby não confere nada sozinho. O que ele resolve sem você fazer nada é o
   outro: `if valor_pago` com `0`. *Pergunta para chegar lá:* no JavaScript, o que `if (0)`
   faz, e no Ruby? Qual dos dois confunde "pagou zero" com "não informado"? E, para o caso do
   índice, qual método da tabela acima reclama em vez de devolver `nil`?
5. **Pergunta 2 — fecha, com complemento.** Imutável e um objeto só (a comparação é por
   identidade, por isso mais barata): certo. O motivo principal, porém, é de significado: o
   símbolo é um **nome** que identifica um estado; string é **texto** para alguém ler. O
   status nunca vai aparecer na tela como está — ele vai ser traduzido para "Pago".

Para a revisão, não para fechar:

- **Pagamento negativo** — `installment_status(-100, 64815)` devolve `:partial`. A guarda
  pega o pagamento acima do valor, mas não abaixo de zero. *O que deveria acontecer?* É a
  pendência "`Money` pode ser negativo?" chegando antes do `Money`.
- `if paid_cents == 0` → `paid_cents.zero?`, o método da aula.
- O último ramo `elsif paid_cents == amount_cents` é o único caso que sobra depois da guarda e
  do `<`; escrito como `elsif`, o `if` devolveria `nil` se um dia nenhum ramo casasse. `else`
  diz que é o caso restante.
- Espaço depois da vírgula nos parâmetros (`(paid_cents, amount_cents)`), espaço sobrando no
  fim das linhas 3 e 12, linha em branco antes do último `end`.
- O editor continua salvando `CRLF`.

### Revisão 2 — 18/10/2026: não fecha — as perguntas fecharam, o código regrediu

Commits `aa604c5` (renomeação) e `d428f6b` (script novo).

**Pergunta 1 — fecha.** "Índice fora do array devolve `nil` no Ruby e `undefined` no JS; os
dois são falsos, então nos dois casos o `if` pula sem avisar. A diferença está no zero: no JS
`if (0)` não entra, e uma parcela paga com `0` cai no mesmo caminho de uma não informada; no
Ruby `if 0` entra, porque só `nil` e `false` são falsos." Faltou só nomear a ferramenta do
índice — o `fetch`, que reclama em vez de devolver `nil`.

**Pergunta 2 — fecha.** Imutabilidade e objeto único são consequências; o motivo é o
significado — símbolo identifica estado dentro do código, string é texto para uma pessoa.

**Mas os dois scripts commitados estão quebrados:**

```text
$ docker compose run --rm ruby ruby -w sandbox/modulo-04/01-divisao.rb
…/01-divisao.rb:4:in '<main>': undefined local variable or method 'valor_fornecedor' for main (NameError)

$ docker compose run --rm ruby ruby -w sandbox/modulo-04/02-installment-status.rb
…/02-installment-status.rb:2:in 'Object#installment_status': Pagamento enviado como nulo, valor deve ser positivo e não nulo (ArgumentError)
```

1. **`01-divisao.rb` — renomeação pela metade.** As linhas 1 e 2 declaram `supplier_value` e
   `number_installments`; as linhas 4 e 5 ainda usam `valor_fornecedor` e `numero_parcelas`.
   O commit `aa604c5` foi feito sem rodar o script uma vez.
2. **`02-installment-status.rb` — o experimento foi commitado no lugar da entrega.** A prova do
   `nil` era: tirar o tratamento, rodar, ver o erro, **desfazer**. O arquivo commitado ficou com
   o `nil` lançando `ArgumentError` e com seis dos sete casos comentados. O comentário da linha
   20 ainda diz `# => :pending` — o próprio arquivo discorda do que faz.
   Se lançar no `nil` foi uma **decisão** e não um resto do experimento, ela contraria o
   domínio: `nil` é "nenhum pagamento registrado", que é exatamente o estado `:pending` — não
   um erro de quem chamou. *Qual foi a intenção?*
3. **O negativo piorou.** Com o `&& paid_cents > 0` no ramo `:partial`, um `-100` não cai mais
   em `:partial` — cai no `else`, e `installment_status(-100, 64815)` agora devolve **`:paid`**.
   Uma parcela "paga" com dinheiro negativo. A guarda certa é do mesmo tipo da que já existe
   para o pagamento acima do valor: *o que impede o `-100` de chegar ao `if`?*
4. **Ruby do Windows** — continua instalado e a decisão (desinstalar ou mudar a convenção) não
   veio.

> [!warning] Terceira vez: commit sem rodar a verificação
> Na 4.1 o `01-divisao.rb` foi commitado com o experimento do `Float`; agora os dois scripts.
> A verificação de cada aula é um comando — rodá-lo **antes** do `git commit` é o que impede
> que o histórico guarde código que não funciona. Registrado no
> [padrão a vigiar](../onde-estou.md#padrão-a-vigiar).

Menores, ainda da revisão 1: espaço depois da vírgula em `paid?(paid_cents,amount_cents)`,
espaço sobrando depois do `end` da linha 12, linha em branco antes do último `end`, `CRLF` no
script. E os nomes novos: `base_installments_value` é o valor de **uma** parcela —
`installment_base`, sem plural, conta melhor; `remain_value` → `remainder`.

### Revisão 3 — 18/10/2026: não fecha — falta um arquivo

Commits `01bc775` e `2be82b9`.

**`02-installment-status.rb` — resolvido.**

```text
$ docker compose run --rm ruby ruby -w sandbox/modulo-04/02-installment-status.rb
:pending
:pending
:partial
:paid
#<ArgumentError: Pagamento negativo enviado, valor deve ser positivo>
true
false
#<ArgumentError: Pagamento acima do valor da parcela>
```

`nil` volta a ser `:pending`, os casos voltaram, e o negativo agora **lança** em vez de virar
`:paid` — com um caso próprio na saída, o que é melhor que a lista pedida. (A tarefa pedia `p`
da **classe**; `p e` imprime o erro inteiro. Tanto faz aqui; vale saber a diferença.)

Para revisar, não para fechar: o `nil` agora é tratado em três lugares — `paid_cents &&` em
cada guarda e `paid_cents == nil ||` no `if`. A primeira versão resolvia em uma linha.
*O que o `paid_cents ||= 0` fazia que tornaria os outros três desnecessários?* E
`paid_cents == nil` tem nome na aula: `paid_cents.nil?`.

**`01-divisao.rb` — ainda quebrado, de outro jeito:**

```text
$ docker compose run --rm ruby ruby -w sandbox/modulo-04/01-divisao.rb
…/01-divisao.rb:5:in '<main>': undefined local variable or method 'installment_number' for main (NameError)
```

A linha 2 declara `installments_number`; a linha 5 usa `installment_number` (sem o `s`) e a
linha 9, `number_installments` (a ordem antiga). Três grafias para a mesma variável. O commit
`01bc775` ("fix: variables with old names") foi feito, de novo, sem rodar o script — **quarta
vez** do padrão.

**Ruby do Windows** — `where ruby` ainda acha `C:\Ruby40-x64\bin\ruby.exe`, e a decisão não
veio.

Também: `refactor:` é para mudança que **não** altera comportamento. `2be82b9` mudou o que o
método faz com `nil` — é `fix:`.

### Revisão 4 — 18/10/2026: fecha

Commit `f042a9a`: as três grafias viraram uma só, `installments_number`.

```text
$ docker compose run --rm ruby ruby -w sandbox/modulo-04/01-divisao.rb
64814
22
true
```

O `02-installment-status.rb` segue igual à revisão 3. As duas perguntas em voz alta já tinham
fechado na revisão 2. Aula fechada.

**Ruby do Windows — decidido.** O João mantém o Ruby 4.0.7 instalado no Windows por motivos
fora deste projeto. A [convenção](../convencoes.md#ruby-roda-no-container) foi ajustada: o Ruby
da máquina pode existir, mas **neste projeto** comando e verificação rodam no container.

O que a aula deixou: o primeiro método do domínio em Ruby — o status da parcela **derivado**,
nunca guardado, como manda o [README](../../../README.md) —, guardas que lançam para pagamento
negativo e acima do valor, e a diferença entre o falso do JavaScript e o do Ruby explicada nas
próprias palavras.

## Pendências

- O `nil` tratado em três lugares no `installment_status`; um `paid_cents ||= 0` no começo
  resolve os três. `paid_cents == nil` → `paid_cents.nil?`.
- `base_installments_value` → `installment_base`; `remain_value` → `remainder`.
- Espaço depois da vírgula em `paid?(paid_cents,amount_cents)`, espaço sobrando depois do `end`,
  indentação dentro do `begin` da linha 25, `CRLF` no script.
- **Rodar a verificação antes de cada commit** — quatro commits quebrados entre a 4.1 e a 4.2
  (ver o [padrão a vigiar](../onde-estou.md#padrão-a-vigiar)).
