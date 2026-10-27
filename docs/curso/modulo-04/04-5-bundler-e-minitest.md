---
tipo: aula
modulo: 4
aula: "4.5"
status: em-andamento
conceitos:
  - bundler
  - bundled-gems
  - require
  - minitest
  - assercao
  - rake
tags:
  - curso/aula
  - curso/modulo-04
---

# Aula 4.5 — Bundler e Minitest: o `Money` com testes de verdade

**Status:** em andamento — tarefa passada em 26/10/2026.

## Contexto

O `check` e o `check_error` nasceram na 4.3 e foram copiados para a 4.4. Nas duas aulas eles
mostraram três limites:

- **Erro fora do `check` mata o script.** Na prova de estragar da 4.4, sem o `Comparable`, o
  `b > a` lançou `NoMethodError` e todos os casos depois dele deixaram de rodar.
- **`check_error` aceita qualquer `ArgumentError`.** Sem o `initialize`, o erro de aridade
  (*"wrong number of arguments"*) também é um `ArgumentError`, e os casos de erro passariam
  `OK` sem testar nada.
- **Classe e testes no mesmo arquivo.** Rodar o `04_money.rb` roda os testes. Na 4.6 o
  `Contract` vai precisar do `Money`, e um `require` do arquivo executaria todos os `check`.

No módulo 1, o [`04-testes.ts`](../../../sandbox/modulo-01/test/04-testes.ts) tinha os mesmos
problemas, com o `verificar` caseiro. Esta aula troca os dois pelo Minitest, a biblioteca de
testes que vem com o Ruby, e porta para ela a parte do `04-testes.ts` que é do `Money`. A parte
do contrato fica para a 4.6.

## Teoria

### Vem com o Ruby, mas não está no `Gemfile`

No container, o Minitest já está instalado:

```text
$ ruby -e 'require "minitest/autorun"; puts Minitest::VERSION'
6.0.0
$ bundle exec ruby -e 'require "minitest/autorun"'
…in 'Kernel.require': cannot load such file -- minitest/autorun (LoadError)
```

O mesmo `require` funciona no `ruby` puro e falha no `bundle exec`. O Ruby distribui algumas
gems junto com o interpretador (as *bundled gems*: `minitest`, `rake`, `test-unit` e outras).
O `ruby` puro enxerga **tudo** o que está instalado. O `bundle exec` enxerga **só** o que o
`Gemfile.lock` declara. Isso é de propósito: é o comportamento que a
[convenção](../convencoes.md#ruby-bundler-e-bundle-exec) quer. O que não está no lockfile não
existe para o projeto, mesmo que esteja na máquina.

O equivalente em JS seria um pacote que existe no `node_modules` global mas não no
`package.json`: funciona na sua máquina e quebra na CI.

### `require` e `require_relative`

| TypeScript | Ruby |
|---|---|
| `import { Money } from "./money.ts"` | `require_relative 'money'` (caminho relativo **a este arquivo**) |
| `import { describe } from "vitest"` | `require 'minitest/autorun'` (procura nas gems e no *load path*) |

O `require` executa o arquivo **uma vez** e não importa nomes: tudo o que o arquivo define
(classes, métodos) passa a existir. Por isso um arquivo de classe não pode ter código solto no
topo. Se tiver, ele roda em todo `require`.

### `Minitest::Test`

```ruby
# frozen_string_literal: true

require 'minitest/autorun'
require_relative '../duration'

# Tests for Duration.
class DurationTest < Minitest::Test
  def test_keeps_the_seconds
    assert_equal 90, Duration.from_seconds(90).seconds
  end

  def test_rejects_negative_seconds
    error = assert_raises(ArgumentError) { Duration.from_seconds(-1) }

    assert_equal 'seconds must be a non-negative Integer', error.message
  end
end
```

- Cada método que começa com `test_` é **um teste**. O resto da classe é ajuda (`setup`,
  métodos privados).
- Cada teste roda **isolado**. Um erro dentro de um teste marca aquele teste e passa para o
  próximo, sem matar a suíte.
- A ordem é **aleatória** a cada execução (o `--seed` da saída). Um teste não pode depender de
  outro ter rodado antes.
- O `require 'minitest/autorun'` faz os testes rodarem quando o arquivo termina, como o
  `vitest run` faria.

### Asserções

| Minitest | Pergunta | Equivalente no `check` |
|---|---|---|
| `assert_equal esperado, obtido` | são `==`? | `check('…', a == b)` |
| `assert valor` / `refute valor` | é verdadeiro / falso? | `check('…', valor)` |
| `assert_operator a, :>, b` | `a > b`? | `check('…', a > b)` |
| `assert_predicate obj, :frozen?` | `obj.frozen?`? | `check('…', obj.frozen?)` |
| `assert_nil valor` | é `nil`? | `check('…', valor.nil?)` |
| `assert_raises(Classe) { … }` | o bloco lança essa classe? **Devolve o erro** | `check_error` |

Dois detalhes que mudam o resultado:

- **A ordem do `assert_equal` é `esperado, obtido`.** Trocada, o teste passa e falha igual, mas
  a mensagem de falha mente: *"Expected: 90, Actual: 91"* com os papéis invertidos.
- **O `assert_raises` devolve o erro.** Comparar o `error.message` é o que separa "lançou pelo
  motivo certo" de "lançou um `ArgumentError` qualquer". É o conserto do problema da aridade.

A saída tem uma letra por teste: `.` passou, `F` (*failure*) é uma asserção falsa, `E`
(*error*) é uma exceção que **nenhuma** asserção esperava, `S` é um teste pulado.

```text
.EF.
  1) Error:
DurationTest#test_errors:
NoMethodError: undefined method 'negative?' for nil
  2) Failure:
DurationTest#test_fails_on_purpose [test/duration_test.rb:15]:
Expected: 91
  Actual: 90
4 runs, 4 assertions, 1 failures, 1 errors, 0 skips
```

### Rake: os scripts do `package.json`

A [convenção](../convencoes.md#comando-repetido-vira-script) diz que comando repetido vira
script. Em Ruby, quem faz isso é o Rake, com um `Rakefile` na raiz:

```ruby
# frozen_string_literal: true

require 'minitest/test_task'

Minitest::TestTask.create do |t|
  t.test_globs = ['caminho/para/test/**/*_test.rb']
end

task default: :test
```

Com ele, `bundle exec rake` roda todos os arquivos que terminam em `_test.rb`. O
`bundle exec rake -T` lista as tarefas, como o `pnpm run` sem argumento.

## Tarefa

1. **Ver o `LoadError` antes de consertar.** Rode, no container,
   `bundle exec ruby -e 'require "minitest/autorun"'` e guarde a mensagem.

2. **Declarar as gems**, pelo container e com `bundle add`: `minitest` no grupo `test` e `rake`
   no grupo `development`. Confira no diff do `Gemfile.lock` quais versões entraram, e que as
   três plataformas continuam lá. Rode o comando do item 1 de novo.

3. **Separar a classe dos testes:**
   - `git mv sandbox/modulo-04/04_money.rb sandbox/modulo-04/money.rb`, e deixe nele **só** a
     classe `Money`, sem `check` e sem código solto;
   - `sandbox/modulo-04/test/money_test.rb`, com `class MoneyTest < Minitest::Test`.

4. **Calibração**, o equivalente do primeiro `FAILED`: um teste com `flunk 'calibration'`.
   Veja o `F` na saída e **apague** o teste. Calibração não fica na suíte.

5. **Os testes.** Um `test_` por comportamento, com nome que diga o comportamento
   (`test_split_puts_the_extra_cent_in_the_first_installments`, não `test_split_2`):
   - os 20 casos da 4.4, convertidos;
   - todo `assert_raises` confere também o `message`;
   - do `04-testes.ts`, o que é do `Money` e ainda não está coberto: `split(6)` de 1_750_000
     (6 parcelas, soma igual ao total, primeira **maior** que a última), `split(3)` de 100,
     `split(1)` de 1, `split(10)` de 10, e "somar não altera o valor anterior";
   - nenhum `if` decidindo se um `assert` roda. Era a pendência do `if (parc[0] && parc[5])`,
     do módulo 2.

6. **`Rakefile`** na raiz, com a tarefa `test` apontando para `sandbox/modulo-04/test/` e
   `default: :test`.

7. **Prova de estragar**, com a suíte verde:
   - apague o `initialize` inteiro, que foi o bug do primeiro commit da 4.4. Quais testes viram
     `F` e quais viram `E`? Algum teste de erro continuou passando? Compare com o que o
     `check_error` fazia;
   - troque o `i < remainder` por `i >= count - remainder`, a prova da 4.3. Os mesmos casos
     acusam?

   Desfaça as duas trocas.

8. **Commits**, sem o trailer `Co-authored-by`:
   - `chore:` para `Gemfile`, `Gemfile.lock` e `Rakefile`;
   - `refactor:` para separar a classe;
   - `test:` para a suíte.

## Verificação

```bash
docker compose run --rm ruby bundle exec rake
```

Última linha: `N runs, M assertions, 0 failures, 0 errors, 0 skips`, com `N` igual ao número de
`test_` e nenhum `warning`.

```bash
docker compose run --rm ruby ruby -w sandbox/modulo-04/money.rb
```

Nenhuma saída. O arquivo da classe não executa nada.

```bash
docker compose run --rm ruby bundle exec rubocop
```

`no offenses detected`. Dois cops devem aparecer pelo caminho: o `Style/Documentation`, que
também vale para a classe de teste, e o `Metrics/ClassLength`, se a `MoneyTest` passar de 100
linhas. Nesse caso, separe por assunto, por exemplo `money_split_test.rb`.

## Perguntas para responder em voz alta

1. **Por que `ruby -e 'require "minitest/autorun"'` funciona e o mesmo comando com `bundle exec`
   não? O que aconteceria na CI do módulo 10 se o projeto rodasse os testes sem o Bundler?**
2. **`F` e `E`: qual a diferença? Os bugs da 4.4 (o `Integer?` e o `initialize` faltando) teriam
   aparecido como qual dos dois?**
3. **Por que o Minitest embaralha a ordem dos testes? Que tipo de bug isso pega?**

## Pendências herdadas

- `if (parc[0] && parc[5])`, o teste que pula em silêncio, do
  [módulo 2](../modulo-02/02-4-higiene-dos-testes.md): fecha com o item 5.
- `03_split_installments.rb` continua com o `check` próprio, como registro da 4.3. A regra
  dele agora vive no `Money#split`.
