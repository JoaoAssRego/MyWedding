---
tipo: modulo
modulo: 4
status: concluido
tags:
  - curso/modulo
  - curso/modulo-04
---

# Módulo 4 — Ruby essencial

**Entregável:** `Money` e `Contract` portados para Ruby — soma, divisão em parcelas sem perder
centavo, imutabilidade —, com testes em Minitest, tudo rodando dentro de um container Docker.
**Onde vive o código:** `sandbox/modulo-04/`, com o `compose.yaml` na raiz do repositório.
**Status:** concluído em 31/10/2026, com a [revisão oral](#revisão-oral-de-fechamento) fechada na segunda tentativa.

## Por que Ruby antes de Rails

O Rails esconde muito. Dá para gerar um CRUD inteiro sem escrever uma linha de Ruby que se
entenda — e depois travar no primeiro `has_many`, no primeiro bloco `do |x|`, no primeiro
`self.` dentro de uma classe. Este módulo é o equivalente dos módulos 1 e 2 para a linguagem
nova: **a linguagem primeiro, o framework depois**.

A vantagem é que não se parte do zero. O João já sabe o que é objeto, classe, imutabilidade,
value object e teste; o que muda é a sintaxe e algumas ideias que o JavaScript não tem. Por isso
cada aula compara com o equivalente em JS/TS ([como-ensinar.md](../como-ensinar.md#formato-de-uma-aula)).

| Já sabe em JS/TS | Vai ver em Ruby |
|---|---|
| `pnpm`, `package.json`, lockfile | Bundler, `Gemfile`, `Gemfile.lock` |
| `node arquivo.ts` | `ruby arquivo.rb`, `irb` para experimentar |
| `class`, `#campo`, `static` | `class`, `@variavel`, `attr_reader`, `self.` |
| `Object.freeze` | `freeze`, e strings que podem ser mutáveis |
| `array.map(x => …)` | blocos: `array.map { \|x\| … }`, `Enumerable` |
| `null` e `undefined` | só `nil` — e tudo é objeto, inclusive ele |
| interface / tipagem estrutural | *duck typing*, módulos e `include` |
| `verificar` caseiro | Minitest, que vem com o Ruby |

## Ambiente: Ruby em Docker

Não há Ruby instalado no Windows, e não vai haver: Ruby roda num container a partir da imagem
oficial `ruby`, com a versão fixada em tag exata (a mesma lógica do lockfile — a máquina de hoje
e a CI de amanhã rodam a mesma coisa). O João escreve o `compose.yaml` na aula 4.1; no módulo 5
ele ganha o serviço do Postgres e o da API.

> [!warning] Atritos previstos na aula 4.1
> - **Fim de linha.** O Git no Windows pode converter `LF` em `CRLF`. Um script com `CRLF` falha
>   dentro do Linux do container com erro que não parece ter nada a ver com isso.
> - **Arquivos criados pelo container** podem nascer com dono `root` no volume montado.
> - **Container que some.** `docker compose run --rm` apaga o container no fim; o que foi
>   instalado dentro dele sem estar no `Gemfile` some junto. É de propósito.

## Aulas

Cada arquivo nasce quando a aula for passada.

| # | Aula | Status |
|---|---|---|
| 4.1 | [Ruby em Docker: imagem, `compose.yaml` e `irb`](04-1-ruby-em-docker.md) | concluída |
| 4.2 | [Tudo é objeto: `nil`, símbolos, *truthiness* e métodos com `?` e `!`](04-2-tudo-e-objeto.md) | concluída |
| 4.3 | [Coleções, blocos e `Enumerable`: as parcelas como lista](04-3-colecoes-e-blocos.md) | concluída |
| 4.4 | [Classes, `Comparable` e `freeze`: o `Money` em Ruby](04-4-classes-e-money.md) | concluída |
| 4.5 | [Bundler e Minitest: o `Money` com testes de verdade](04-5-bundler-e-minitest.md) | concluída |
| 4.6 | [`Contract` e parcelas: o domínio completo em Ruby](04-6-contract-e-parcelas.md) | concluída |

## Nomes em inglês a partir daqui

O domínio do sandbox TypeScript está em português (`Contrato`, `dividirEmParcelas`). Em Ruby ele
nasce em inglês: `Money`, `Contract`, `Installment`. O motivo é o Rails — o *inflector* que
transforma `Contract` em tabela `contracts` é inglês, e o modelo do [README](../../../README.md)
já está em inglês. A regra está em [convencoes.md](../convencoes.md#idiomas).

## Pendências herdadas

- **`Money` pode ser negativo?** Continua aberta. O port mantém o comportamento atual
  (`subtrair` lança abaixo de zero); a resposta definitiva vem no módulo 6, com o `CHECK` da
  coluna.

Do sandbox TypeScript, para **não repetir no port** (todas nascidas no [módulo 2](../modulo-02/README.md#pendências-do-módulo)):

- ~~getters no estilo Java (`getId()`)~~ — `attr_reader` no `Contract`, fechada na [4.6](04-6-contract-e-parcelas.md);
- ~~nomes que descrevem o tipo em vez do conteúdo (`arrayObjectParcelas`)~~ — `installments`, fechada na [4.6](04-6-contract-e-parcelas.md);
- ~~teste que pula em silêncio quando o dado vem curto (`if (parc[0] && parc[5])`)~~ — fechada
  na [4.5](04-5-bundler-e-minitest.md): nenhum `if` decide se uma asserção roda.

## Revisão oral de fechamento

A mesma porta dos módulos [2](../modulo-02/README.md#revisão-oral-de-fechamento) e
[3](../modulo-03/README.md#revisão-oral-de-fechamento): explicar em voz alta, **sem olhar o
código nem as notas**.

1. **O ambiente.** Por que o Ruby do projeto roda no container e não no Ruby do Windows? O que
   acontece com uma gem instalada com `gem install` dentro de um `docker compose run --rm`? E o
   volume `gems`: o que ele guarda, e por que ele **não** substitui o `Gemfile.lock`?
2. **Verdade e nada.** Em Ruby, quais valores são falsos num `if`? Compare com o JavaScript
   (`0`, `""`, `undefined`). E o que o `?` e o `!` no fim do nome de um método prometem? Dê um
   exemplo de cada no seu código.
3. **O caso 3 da 4.3.** Conte o bug em que o `each` foi comparado com `1_750_000`: o que o
   `each` devolveu, por que o teste falhou **em silêncio**, e qual método resolveu numa palavra.
4. **O nascimento de um `Money`.** Do `Money.from_cents(5)` até o objeto congelado: quem chama
   quem, onde mora a validação, e por que ela mora ali e não na fábrica. O que o
   `Money.send(:new, -5)` faria?
5. **Igualdade.** Com um só método, o `<=>`, o que o `Comparable` entrega? Por que ele não basta
   para usar `Money` como chave de `Hash`? E por que o teste "não é `==` a um `Integer`"
   continuou passando quando o `Comparable` foi tirado?
6. **O que prova que funciona.** O `02` e o primeiro `04_money.rb` passaram limpos no RuboCop
   e estavam quebrados. O `check_error` passaria com o `initialize` faltando. O que cada
   ferramenta garante (RuboCop, teste, prova de estragar), e o que nenhuma delas garante
   sozinha?

Respondidas, o módulo 4 fecha no [checklist do plano](../00-plano-de-estudos.md#progresso) e o
módulo 5 (Rails API e Postgres) começa.

### Primeira tentativa — 31/10/2026: quase fecha

- **1 (ambiente):** fecha, e corrige a pergunta. Com o volume `gems` em `/usr/local/bundle`, uma
  gem do `gem install` **sobrevive** ao `--rm`, mas continua fora do `Gemfile.lock` e invisível
  para o `bundle exec`. "Armazenamento × contrato reproduzível" é a distinção certa.
- **2 (verdade e nada):** fecha a tabela (só `false` e `nil` são falsos). Falta metade do
  pedido: o exemplo de `!` **do seu código**. O `capitalize!` é da linguagem. O projeto tem
  `validate_count!` e `validate_payment!`, e neles o `!` não quer dizer "altera", mas outra
  coisa. O quê?
- **3 (o caso 3 da 4.3):** **não fecha.** A explicação do `each` está certa, mas o conserto
  não foi o `map`. O `map` também devolve um array, e `[…] == 1_750_000` continuaria `false`. O
  método que resolveu numa palavra foi outro, e ele está na revisão 3 da
  [aula 4.3](04-3-colecoes-e-blocos.md).
- **4 (nascimento do `Money`):** fecha, inclusive o `send(:new, -5)` parando no `initialize`.
- **5 (igualdade):** fecha, com o "por acaso" do `==` de identidade bem explicado.
- **6 (o que prova que funciona):** fecha. A última lista ("nenhuma substitui revisão do
  domínio, integração e execução no ambiente real") é a conclusão do módulo.

> [!note] Sobre o formato
> A porta é **sem olhar o código**. As respostas 4 e 5 trazem trechos idênticos ao
> `money.rb`, incluindo a quebra de linha do `raise`. O conteúdo está certo. Fica registrado
> que o único erro de conteúdo (`map` no lugar de `sum`) apareceu justamente onde não havia
> código para copiar.

Para fechar: a 3 de novo, e o `!` do item 2 com um exemplo do projeto, as duas de memória.

### Segunda tentativa — 31/10/2026: fecha

- **3:** `sum`. `array_installments.sum == 1_750_000` reduz as parcelas a um total. Fecha.
- **2:** nos métodos do projeto, o `!` avisa que o método **pode interromper o fluxo com uma
  exceção**, não que ele altera algo. O `!` é um "atenção" e não significa obrigatoriamente
  mutação. Fecha.

O módulo 4 fecha: seis aulas concluídas, entregável completo (`Money`, `Installment` e
`Contract` com Minitest, no container) e revisão oral fechada na segunda tentativa.
