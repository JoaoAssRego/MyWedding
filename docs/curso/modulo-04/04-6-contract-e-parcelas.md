---
tipo: aula
modulo: 4
aula: "4.6"
status: concluida
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

**Status:** concluída em 31/10/2026, na terceira revisão.

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

## O que aconteceu

### Decisão — 30/10/2026: a regra do "cabe no total" mora só no `Money#split`

O João perguntou por que o `split` valida, se o `Contract` também ia validar. A resposta foi
que o `split` é público e protege a própria regra, seja quem for que o chame. Sem a guarda,
`5.divmod(10)` produz parcelas de R$ 0,00 sem erro. A decisão dele: **não repetir a guarda no
`Contract`**, para que a regra tenha uma fonte só.

Consequência para a tarefa: o item 4 pede que o erro de "5 centavos em 10 parcelas" aconteça
**ao criar** o contrato. Para isso, sem duplicar a regra, o `initialize` precisa passar pelo
`split`. Se ninguém chamar o `split` antes do `installments`, o erro chega tarde, e a pergunta
2 trata justamente disso.

Na mesma conversa, o João escolheu **guardar o resultado no `initialize`**: o `split` roda uma
vez na criação, valida e já produz as parcelas, e o `installments` só devolve o que foi
guardado. A justificativa fica para a entrega.

### Revisão 1 — 31/10/2026: não fecha

Commits `ba18db5` e `bf00923` (`feat:`), `21f110a` (`feat:`) e `f94b08d` (`test:`), sem o
trailer. No container, **a suíte nem carrega**:

```text
$ docker compose run --rm ruby bundle exec rake
contract.rb:11:in 'Contract#initialize': undefined local variable or method 'validate_initialize' … (NameError)
Did you mean?  validade_initialize
	from sandbox/modulo-04/sample_contracts.rb:6
	from sandbox/modulo-04/test/contract_test.rb:6
rake aborted!
```

O `initialize` chama `validate_initialize`, e o método definido se chama
`validade_initialize`. O `sample_contracts.rb` cria os contratos já no `require`, então o erro
derruba o carregamento de **todos** os arquivos de teste, inclusive os 25 do `Money`, que
estavam verdes. Nenhum teste roda.

Corrigindo só o nome, por diagnóstico e sem tocar no arquivo, aparece o segundo bug:

```text
Contract.new(id: '1', vendor: 'x', total: Money.from_cents(100), installment_count: 3)
# => ArgumentError: Total must be Money
```

A validação usa os leitores `total` e `installment_count` **antes** de o `initialize`
atribuir `@total` e `@installment_count`. Os dois valem `nil`, e **todo** contrato válido é
recusado.

> [!warning] A prova de estragar não pode ter rodado neste código
> O relato traz nomes de teste e resultados (`F` no `test_installment_count_greater_than_total`,
> `ZeroDivisionError` nos testes do `split`). Com o `HEAD`, o `rake` aborta antes de qualquer
> teste, e com o nome corrigido nenhum contrato é criado. Os resultados vieram de outra versão
> do código, não commitada, ou de outro ambiente. Pedido: rodar de novo depois do conserto.

**O que impede de fechar:**

1. `validate_initialize` × `validade_initialize`.
2. Validação lendo `@` que ainda não existem. Valide os **argumentos** (`total`,
   `installment_count`, que no `initialize` são variáveis locais) ou atribua antes.
3. `Installment`: `number < 1` não confere o tipo. `Installment.new(2.5, money)` é aceito, e
   `Installment.new(nil, money)` dá `NoMethodError` em vez de `ArgumentError`. A tarefa pedia
   `Integer >= 1`. Mensagem: *"a Integer greather"* → *"an Integer greater"*.
4. `sample_contracts.rb`:
   - o Gauss é **R$ 3.900,00** (`390_000`), não `4_500`;
   - os `id` são strings no TS (`"1"`, `"2"`);
   - `SAMPLE_CONTRACTS` não está congelado (RuboCop `Style/MutableConstant`);
   - variáveis em português (`contrato_salao`).
5. Testes que a tarefa pedia e não vieram: `installments.frozen?` e `FrozenError` no `<<`. O
   relato da prova reconhece isso (*"a suíte continuou verde, pois não há teste"*), e é
   exatamente o buraco que a prova deveria mostrar **depois** de o teste existir. Também falta
   `SAMPLE_CONTRACTS.frozen?`.
6. Testes do contrato usam `SAMPLE_CONTRACTS[0]` (Casarão), com `27` e `[26]` fixos. A tarefa
   pedia o Gauss (`[1]`), e `first`/`last` + `installment_count` deixam o teste independente
   do número.
7. `assert_equal @installment_generated.size, @contrato.installment_count`: ordem invertida (o
   esperado vem primeiro). O `test_contract_exists` não testa nada que o `setup` já não teria
   quebrado. O comentário da `ContractTest` diz *"Test of installment"*, e o `setup` dela não é
   usado.
8. RuboCop: `Layout/EndOfLine` no `contract_test.rb`, cuja cópia de trabalho está em `CRLF`, e
   o `MutableConstant` do item 4.

Detalhe de desenho, para justificar na entrega: o `Contract` repete a regra "`Integer >= 1`" que
o `split` já tem, mas deixa o "cabe no total" só no `split`, como foi decidido acima. Por que
uma regra é duplicada e a outra não?

**Perguntas em voz alta:** a 1 e a 2 fecham. A 3 chegou cortada: termina em *"isto ainda
funcionaria:"*, sem o exemplo e sem a conclusão.

### Revisão 2 — 31/10/2026: verde, mas não fecha

Commits `23c9175` (`fix:` validação), `b1332e9` (`fix:` mensagens do `split`) e `6826554`
(`test:`). Verificado no container: **`36 runs, 66 assertions, 0 failures, 0 errors`**;
RuboCop `0 offenses`.

Resolvidos: o nome do método e a ordem da validação (o `Contract` valida o argumento `total` e
deixa **toda** a regra do `installment_count` para o `split`, o que responde ao detalhe de
desenho: uma fonte só, sem duplicar o `Integer >= 1`); o `Installment` confere
`is_a?(Integer)`; os `id` são strings; `SAMPLE_CONTRACTS` congelado; nomes em inglês; ordem do
`assert_equal`; `first`/`last` + `installment_count` no lugar de `27`/`[26]`; o `setup` morto e
o comentário errado.

**Pergunta 3:** fecha. O `freeze` é raso, `contract.installments << :x` funcionaria num
contrato congelado, e por isso objeto e array são congelados separadamente.

**O que impede de fechar:**

1. **Gauss:** R$ 3.900,00 são `390_000` centavos. `3_900` são R$ 39,00.
2. **Testes que a tarefa pede e ainda não existem:** `contract.installments.frozen?`,
   `assert_raises(FrozenError) { contract.installments << … }`, `SAMPLE_CONTRACTS.frozen?`, e o
   `Installment.new(2.5, …)`, agora que o tipo é conferido.
3. **Prova de estragar**, refeita com o código que está no `HEAD` e **depois** do item 2. Com o
   teste do `FrozenError` existindo, tirar o `.freeze` precisa derrubar alguma coisa.

Menores: *"Count need to be"* → *"must be"*; o `03_split_installments.rb` é registro da 4.3 e
não precisava ter mudado; `contract_fotograph` → `photographer_contract`.

### Revisão 3 — 31/10/2026: fecha

Commits `d0be997` (Gauss em `390_000`), `247cc6e` (testes de `freeze`, `FrozenError`,
`SAMPLE_CONTRACTS` e `2.5`) e `4be8db5` (*"must be"*). Verificado no container:
**`40 runs, 71 assertions, 0 failures, 0 errors`**; RuboCop limpo; `installment.rb`,
`contract.rb`, `sample_contracts.rb` e `money.rb` rodados sozinhos não imprimem nada.

**Prova de estragar:** o relato bate com o que o Claude rodou numa cópia, no container. Sem o
`.freeze` em `installments`, caem exatamente `test_installments_are_frozen` e
`test_installments_cannot_be_modified` (2 `F`). Desta vez a prova rodou no código do `HEAD`, com
o teste já existindo: é a ordem certa.

A aula fecha, e com ela as duas pendências do módulo 2: não há *getter* no estilo Java
(`attr_reader`) nem `arrayObjectParcelas` (`installments`). Com a 4.6, o entregável do
módulo 4 está completo: `Money`, `Installment` e `Contract` em Ruby, testados com Minitest, no
container. Falta a revisão oral do módulo.
