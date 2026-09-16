import {
  gerarParcelas,
  dividirEmParcelas,
  formatarCentavos,
  somar,
} from "./money.js";

const contratosFotografo = {
  nome: "Gauss",
  totalCentavos: 3900,
  numeroParcelas: 20,
};

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

function verificarFormatarCentavos(descricao, condicao) {
  if (condicao) {
    console.log("OK", descricao);
  } else {
    console.log("FALHOU", descricao);
  }
}

const parcelasGeradas = gerarParcelas(contratosFotografo);

verificar(
  "gerarParcelas devolve a quantidade certa de objetos",
  parcelasGeradas.length === contratosFotografo.numeroParcelas,
);

verificar("a primeira tem numero igual a 1", parcelasGeradas[0].numero === 1);

verificar(
  "a última tem numero igual ao número de parcelas",
  parcelasGeradas[parcelasGeradas.length - 1].numero ===
    contratosFotografo.numeroParcelas,
);

let somaValorCentavos = 0;
for (let i = 0; i < parcelasGeradas.length; i++) {
  somaValorCentavos += parcelasGeradas[i].valorCentavos;
}

verificar(
  "a soma dos valorCentavos bate com o total",
  somaValorCentavos === contratosFotografo.totalCentavos,
);

verificar(
  "formatarCentavos recebe: 1750000 deve retornar: R$ 17.500,00",
  formatarCentavos(1750000) === "R$ 17.500,00",
);

verificar(
  "formatarCentavos recebe: 291667 deve retornar: R$ 2.916,67",
  formatarCentavos(291667) === "R$ 2.916,67",
);

verificar(
  "formatarCentavos recebe: 5 deve retornar: R$ 0,05",
  formatarCentavos(5) === "R$ 0,05",
);

// verificarQuantidadeParcelas(
//   "Parcelas devem ser a mesma quantidade",
//   gerarParcelas(contratosFotografo).length ===
//     contratosFotografo.numeroParcelas,
// );

// verificarFormatarCentavos(
//   "formatarCentavos recebe: 1750000 deve retornar: R$ 17.500,00",
//   formatarCentavos(1750000) === "R$ 17.500,00",
// );
// verificarFormatarCentavos(
//   "formatarCentavos recebe: 291667 deve retornar: R$ 2.916,67",
//   formatarCentavos(291667) === "R$ 2.916,67",
// );
// verificarFormatarCentavos(
//   "formatarCentavos recebe: 5 deve retornar: R$ 0,05",
//   formatarCentavos(5) === "R$ 0,05",
// );
/**
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
verificarErro(
  "total menor que o número de parcelas (5 centavos em 10 parcelas)",
  () => dividirEmParcelas(5, 10),
);
verificarErro("zero parcelas", () => dividirEmParcelas(10, 0));
*/
