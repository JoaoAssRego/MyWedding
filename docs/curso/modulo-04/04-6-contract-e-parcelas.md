---
tipo: aula
modulo: 4
aula: "4.6"
status: em-andamento
conceitos:
  - data-define
  - composicao
  - validacao-no-construtor
  - constante-congelada
tags:
  - curso/aula
  - curso/modulo-04
---

# Aula 4.6 — `Contract` e parcelas: o domínio completo em Ruby

**Status:** em andamento — tarefa passada em 28/10/2026.

## Contexto

O `Money` está pronto e testado (4.4 e 4.5). Falta o resto do domínio do sandbox TypeScript:

- [`Contrato`](../../../sandbox/contrato/contrato.ts): `id`, `nome`, `total` (`Money`) e
  `quantidadeParcelas`, com quatro *getters* no estilo Java (`getId()`, `getTotal()`…) e o
  `gerarParcelas`, que devolve `{ numero, valor }` numerados a partir de 1;
- [`Parcela`](../../../sandbox/modulo-01/types/parcela.ts): uma `interface` com `numero` e
  `valor`. No TS ela é só um formato: nada impede `numero: 0` nem alterar o objeto depois;
- [`contratos.ts`](../../../sandbox/contratos/contratos.ts): os dois contratos de exemplo
  (Casarão do Paraiso, R$ 17.500,00 em 27 vezes; Gauss, R$ 3.900,00 em 20).

Duas pendências do módulo 2 vencem aqui: os *getters* no estilo Java e o nome
`arrayObjectParcelas`. A pendência *"`Money` pode ser negativo?"* continua para o módulo 6.

Esta é a última aula do módulo 4. Com ela, o entregável do [módulo](README.md) fica completo:
`Money` e `Contract` em Ruby, com Minitest, no container.

## Teoria

O exemplo continua em outro domínio: uma playlist de faixas, usando a `Duration` da 4.4.

### `Data.define`: o value object que o Ruby escreve por você

Na 4.4 você escreveu à mão o que todo value object precisa: `attr_reader`, `==`, `eql?`,
`hash` e `freeze`. Para objetos que são **só dados**, o Ruby (desde o 3.2) gera tudo isso:

```ruby
Track = Data.define(:position, :seconds)

t = Track.new(position: 1, seconds: 90)   # ou Track.new(1, 90)
t.position                  # => 1
t == Track.new(1, 90)       # => true
[t, Track.new(1, 90)].uniq  # => um só: eql? e hash prontos
t.frozen?                   # => true
t.to_h                      # => {position: 1, seconds: 90}
t.with(seconds: 60)         # => uma Track NOVA; t não muda
Track.new(position: 1)      # ArgumentError: missing keyword: :seconds
```

Conferido no container. O `p t` mostra `#<data Track position=1, seconds=90>`.

| TypeScript | Ruby |
|---|---|
| `interface Parcela { numero; valor }` | `Data.define(:number, :amount)` |
| um formato; o objeto continua mutável | uma classe; a instância nasce congelada |
| `{ ...p, valor: novo }` | `p.with(amount: novo)` |

O `Data` também aceita um bloco, para validar e acrescentar métodos. A validação vai num
`initialize` que recebe **palavras-chave** e termina em `super`, que é quem guarda os campos:

```ruby
Track = Data.define(:position, :seconds) do
  def initialize(position:, seconds:)
    raise ArgumentError, 'position must be an Integer >= 1' unless position.is_a?(Integer) && position >= 1

    super
  end
end
```

Mesmo chamada como `Track.new(1, 90)`, o `Data` converte os argumentos em palavras-chave antes
de chegar no `initialize`. Por isso a validação vale para as duas formas.

**Quando usar `Data` e quando usar classe:** o `Money` tem comportamento próprio (`+`, `-`,
`split`, `<=>` com `Comparable`, um `to_s` com regra), e o construtor dele é privado. Ele fica
como classe. Uma parcela é **um número e um valor**, e o `Data` serve.

### Composição: um objeto que guarda outros

```ruby
# A playlist: a title and an ordered list of tracks.
class Playlist
  attr_reader :title, :tracks

  def initialize(title, durations)
    raise ArgumentError, 'a playlist needs at least one track' if durations.empty?

    @title = title
    @tracks = durations.map.with_index(1) { |d, i| Track.new(position: i, seconds: d.seconds) }.freeze
    freeze
  end

  def total
    tracks.sum(Duration.from_seconds(0)) { |t| Duration.from_seconds(t.seconds) }
  end
end
```

Três coisas para ver aqui:

- **Validar no construtor.** Uma playlist sem faixas não deve nem existir. No TS, um `Contrato`
  com 5 centavos em 10 parcelas era criado sem erro e só quebrava no `gerarParcelas`. O erro
  aparecia longe de onde o dado ruim entrou.
- **Congelar o array também.** O `freeze` do objeto é raso (4.4). Sem o `.freeze` no array,
  `playlist.tracks << outra` funcionaria num objeto "congelado".
- **`sum` com bloco:** `tracks.sum(inicial) { |t| … }` transforma cada elemento antes de somar.
  É o `map` + `sum` numa passada só.

Calcular as faixas uma vez no construtor ou toda vez que alguém pede é uma decisão: guardar
ocupa memória e fixa o resultado; calcular sempre custa tempo e nunca fica velho. Com objetos
imutáveis as duas dão o mesmo resultado, então ela pode ir para qualquer lado. Mas escolha uma e
saiba dizer por quê.

### Constante congelada

```ruby
SAMPLE_PLAYLISTS = [
  Playlist.new('Ceremony', [Duration.from_minutes(4), Duration.from_minutes(3)]),
].freeze
```

Nome em maiúsculas é uma **constante**. O Ruby avisa se você reatribuir, mas **não impede** que
o conteúdo mude: sem o `.freeze`, `SAMPLE_PLAYLISTS << outra` funciona. É o `const` do JS, que
trava o nome e não o array.

## Tarefa

1. **`sandbox/modulo-04/installment.rb`**: `Installment = Data.define(:number, :amount)`.
   - `number` é um `Integer >= 1`, e `amount` é um `Money`. Os dois são validados com
     `ArgumentError` e mensagem própria.
   - Nada de `to_s`, nem de outro método que a tarefa não peça.

2. **`sandbox/modulo-04/contract.rb`**: classe `Contract`.
   - `Contract.new(id:, vendor:, total:, installment_count:)` com palavras-chave, porque são
     quatro argumentos e dois deles têm o mesmo tipo.
   - `attr_reader` para os quatro. Nenhum `get_`, e isso fecha a pendência do módulo 2.
   - Validação no `initialize`: `total` é um `Money`, e `installment_count` é um `Integer >= 1`
     **que cabe no total**. Um contrato que não pode ser parcelado não nasce. Decida se a
     validação do "cabe no total" é escrita de novo aqui ou reaproveitada do `Money#split`, e
     justifique na entrega.
   - `installments` devolve um array de `Installment` numerados a partir de 1, usando o
     `Money#split`. Nome sem "array" e sem "object"; isso fecha a pendência do
     `arrayObjectParcelas`.
   - O contrato e o array devolvido terminam congelados.

3. **`sandbox/modulo-04/sample_contracts.rb`**: a constante `SAMPLE_CONTRACTS` com os dois
   contratos do `contratos.ts`, congelada. Os `id` são strings, como no TS.

4. **Testes** em `test/installment_test.rb` e `test/contract_test.rb`:
   - do `04-testes.ts`, a parte do contrato, usando `SAMPLE_CONTRACTS[1]` (o Gauss, como o TS
     usava `contratos[1]`): a quantidade de parcelas é a do contrato, a primeira tem `number` 1,
     a última tem `number` igual à quantidade, e a soma dos `amount` é igual ao `total`;
   - `Installment`: igualdade por valor, `frozen?`, os dois `ArgumentError` com mensagem;
   - `Contract`: os `ArgumentError` (total que não é `Money`, `installment_count` 0 e 2.5, e 5
     centavos em 10 parcelas), **todos ao criar**, não ao chamar `installments`;
   - `installments.frozen?`, e o array não aceita `<<` (`assert_raises(FrozenError)`);
   - `SAMPLE_CONTRACTS.frozen?`.

5. **Regras:** as mesmas da 4.4, mais esta: nenhum `Hash` como parcela (`{ number:, … }`),
   porque parcela é `Installment`.

6. **Prova de estragar**, com a suíte verde:
   - tire o `.freeze` do array de `installments`. Qual teste cai? Rode
     `contract.installments << :x` no `irb` e diga o que isso faria num relatório;
   - tire a validação do "cabe no total" do `Contract`. Que teste vira `E`, e qual seria a
     mensagem se o `Money#split` não validasse nada?

   Desfaça as duas trocas.

7. **Commits** separados: `feat:` para o `Installment`, `feat:` para o `Contract` e os
   exemplos, e `test:` para a suíte, sem o trailer `Co-authored-by`.

## Verificação

```bash
docker compose run --rm ruby bundle exec rake
```

`0 failures, 0 errors`, com os 25 testes do `Money` mais os novos, sem `warning`.

```bash
docker compose run --rm ruby sh -c 'for f in sandbox/modulo-04/installment.rb sandbox/modulo-04/contract.rb sandbox/modulo-04/sample_contracts.rb; do ruby -w "$f"; done'
```

Nenhuma saída: nenhum desses arquivos executa código solto.

```bash
docker compose run --rm ruby bundle exec rubocop
```

`no offenses detected`.

## Perguntas para responder em voz alta

1. **Por que `Installment` é `Data` e `Money` é classe? O que o `Money` perderia, ou o que
   ficaria estranho, se fosse `Data.define(:cents)`?**
2. **No TS, `new Contrato(..., Money.deCentavos(5), quantidadeParcelas(10))` funcionava, e o
   erro só aparecia no `gerarParcelas`. Por que é melhor o `Contract` falhar na criação?**
3. **`freeze` no objeto e `freeze` no array: por que um não basta?**

## Pendências herdadas

- Getters no estilo Java em `Contrato`, da [aula 2.6](../modulo-02/02-6-money-value-object.md):
  fecha com o item 2.
- `arrayObjectParcelas`, da [aula 2.2](../modulo-02/02-2-revisao-do-modulo-1.md): fecha com o
  item 2.
- **`Money` pode ser negativo?** Continua para o módulo 6.
- `toJSON`/`deJSON` continuam para o Rails (módulo 5).
