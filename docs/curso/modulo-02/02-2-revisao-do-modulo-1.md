# Aula 2.2 — Revisão do código do módulo 1

**Status:** concluída.

## Contexto

Antes de seguir, uma leitura crítica de tudo que existe em `sandbox/modulo-01/`: `money.ts`,
`types/`, `04-testes.js` e `05-contratos.js`.

## O que está certo

Vale registrar, porque é a parte que a maioria erra:

- **Distribuição do resto centavo a centavo.** `Math.floor(total / n)` para o valor base,
  `total % n` para o resto, e o resto somado 1 centavo por parcela nas primeiras. É exatamente
  assim que se faz — nenhum centavo se perde, e a soma das parcelas bate com o total sempre.
- **Guard clauses antes da lógica**, com o valor recebido dentro da mensagem de erro. Quem lê
  o erro sabe o que foi passado, não só que "deu errado".
- **`Intl.NumberFormat`** em vez de montar a string de moeda na mão. Separador de milhar,
  vírgula decimal e símbolo vêm do locale, não de um `replace` frágil.
- **Testes de rejeição.** `verificarErro` testa que a função *recusa* entrada inválida. Isso
  vale tanto quanto testar que ela acerta a entrada válida, e quase todo mundo esquece.

## O que precisa mudar

1. **`money.ts` executa código ao ser importado.** As últimas linhas (`contratoFotografo` +
   `console.log`) rodam toda vez que qualquer arquivo importa o módulo — rodar
   `05-contratos.js` imprime as parcelas do Gauss antes do relatório, sem ninguém ter pedido.
   Módulo exporta; quem executa é o arquivo de entrada.
2. **Nenhuma função exportada declara tipo de retorno** (exceto `gerarParcelas`). A inferência
   acerta, mas o tipo explícito é um *contrato*: quebrada a implementação, o erro aparece na
   função errada e não três arquivos adiante.
3. **`04-testes.js` e `05-contratos.js` ainda são JavaScript.** `noUncheckedIndexedAccess`
   está ligado e não tem efeito nenhum sobre `parcelasGeradas[0].numero`, que é justamente
   onde ele teria algo a dizer.
4. **`somar(arrayParcelas: Array<number>)`** — o nome diz "parcelas", o tipo diz "números
   quaisquer". Ou o nome ou o tipo está mentindo.
5. **`arrayObject`** em `gerarParcelas` é um nome que descreve a estrutura de dados, não o
   conteúdo. Todo array é um array.

Os cinco viraram a tarefa da [aula 2.3](02-3-tipos-no-modulo-1.md).

## Pendências

A guarda `numeroParcelas > totalCentavos` faz com que um contrato de R$ 0,00 seja recusado
(`0` centavos em `1` parcela dispara o erro). Duas leituras possíveis:

- **intencional** — contrato sem valor não existe, e recusar é correto;
- **efeito colateral** — a regra que se queria expressar era "cada parcela precisa de pelo
  menos 1 centavo", e o caso do zero só foi junto por acidente.

A diferença importa porque muda a mensagem de erro e, mais adiante, o que o banco de dados vai
aceitar. **Decisão pendente do João.**
