import { dividirEmParcelas, somar } from "./money.js";

/**verificar(descricao, condicao) recebe um texto e um booleano.
 * Imprime uma linha só, juntando o texto com OK se a condição for
 * verdadeira, ou FALHOU se for falsa. Três linhas, no máximo quatro.
 * Não sabe nada sobre parcelas. */
function verificar(descricao, condicao) {
  if (condicao) {
    console.log("OK", descricao);
  }
  console.log("FALHOU", descricao);
}

function verificarErro(descricao, fn) {
  try {
    fn();
    console.log("FALHOU", descricao);
  } catch (e) {
    console.log("OK", e.message);
  }
}

verificar("Calibração verdadeira: deve imprimir OK", 1 === 1);
verificar("Calibração falsa: deve imprimir FALHOU", 1 === 2);

verificar(
  "Total de 1750000 dividido em 6 parcelas deve somar 1750000",
  somar(dividirEmParcelas(1750000, 6)) === 1750000,
);
verificar(
  "Total de 1750000 dividido em 6 parcelas deve gerar um array com 6 posições",
  dividirEmParcelas(1750000, 6).length === 6,
);
verificar(
  "Total de 1750000 dividido em 6 parcelas: primeira parcela deve ser maior que a última",
  dividirEmParcelas(1750000, 6)[0] > dividirEmParcelas(1750000, 6)[5],
);
verificar(
  "Total de 1200000 dividido em 6 parcelas deve somar 1200000",
  somar(dividirEmParcelas(1200000, 6)) === 1200000,
);
verificar(
  "Total de 100 dividido em 3 parcelas deve somar 100",
  somar(dividirEmParcelas(100, 3)) === 100,
);
verificar(
  "Total de 1 dividido em 1 parcela deve somar 1",
  somar(dividirEmParcelas(1, 1)) === 1,
);
verificar(
  "Total de 10 dividido em 10 parcelas deve somar 10",
  somar(dividirEmParcelas(10, 10)) === 10,
);

verificarErro("parcelas negativas", () => dividirEmParcelas(10, -1));
verificarErro("total em centavos negativo", () => dividirEmParcelas(-100, 5));
verificarErro("valor não inteiro para parcelas", () =>
  dividirEmParcelas(10, 2.5),
);
verificarErro("total menor que o número de parcelas (5 centavos em 10 parcelas)", () =>
  dividirEmParcelas(5, 10),
);
verificarErro("zero parcelas", () => dividirEmParcelas(10, 0));
