import { dividirEmParcelas, somar } from "./01-money.js";

/**verificar(descricao, condicao) recebe um texto e um booleano.
 * Imprime uma linha só, juntando o texto com OK se a condição for
 * verdadeira, ou FALHOU se for falsa. Três linhas, no máximo quatro.
 * Não sabe nada sobre parcelas. */
function verificar(descricao, condicao) {
  if (condicao) {
    console.log("Ok", descricao);
  }
  console.log("FALHOU", descricao);
}

function verificarErro(descricao, fn) {
  try {
    fn();
    console.log("FALHOU");
  } catch (e) {
    console.log("OK", e.message);
  }
}

fn(1750000, 6);
fn(1200000, 6);
fn(100, 3);
fn(1, 1);
fn(10, 10);
fn(10, -1);
fn(-100, 5);
fn(10, 2.5);

verificar(
  "Valor em Centavos é igual",
  somar(dividirEmParcelas(1750000, 6)) === 1750000,
);
verificar(
  "Valor em Centavos é igual",
  somar(dividirEmParcelas(1200000, 6)) === 1200000,
);
verificar(
  "Valor em Centavos é igual",
  somar(dividirEmParcelas(100, 3)) === 100,
);
verificar("Valor em Centavos é igual", somar(dividirEmParcelas(1, 1)) === 1);
verificar("Valor em Centavos é igual", somar(dividirEmParcelas(10, 10)) === 10);

(verificarErro("parcelas negativas", () => somar(dividirEmParcelas(10, -1))),
  verificarErro("total em centavos negativo", () =>
    somar(dividirEmParcelas(-100, 5)),
  ),
  verificarErro("valor não inteiro para parcelas", () =>
    somar(dividirEmParcelas(10, 2.5)),
  ));
