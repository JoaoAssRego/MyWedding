import {
  gerarParcelas,
  dividirEmParcelas,
  formatarCentavos,
  somarCentavos,
} from "./money.ts";

import type { Contrato } from "./types/contrato.ts";
import type { Parcela } from "./types/parcela.ts";

const contratoFotografo: Contrato = {
  nome: "Gauss",
  totalCentavos: 390000,
  numeroParcelas: 20,
};

function verificar(descricao: string, condicao: boolean) {
  if (condicao) {
    console.log("OK", descricao);
  } else {
    console.log("FALHOU", descricao);
  }
}

function verificarErro(descricao: string, fn: () => void): void {
  try {
    fn();
    console.log("FALHOU", descricao);
  } catch (e) {
    if (e instanceof Error) {
      console.log("OK", e.message);
    } else {
      console.log("OK", String(e))
    }

  }
}
const status: number = 1
verificar("Calibração verdadeira: deve imprimir OK", status === 1);
verificar("Calibração falsa: deve imprimir FALHOU", status === 2);

const parcelasGeradas = gerarParcelas(contratoFotografo);

verificar(
  "gerarParcelas devolve a quantidade certa de objetos",
  parcelasGeradas.length === contratoFotografo.numeroParcelas,
);

const primeira = parcelasGeradas[0];
let ultima = parcelasGeradas.at(-1);

verificar("foram geradas parcelas", primeira !== undefined && ultima !== undefined);

if (primeira && ultima) {
  verificar("a primeira tem numero igual a 1", primeira.numero === 1);
  verificar(
    "a última tem numero igual ao número de parcelas",
    ultima.numero === contratoFotografo.numeroParcelas,
  );
}

verificar("foram geradas parcelas", primeira !== undefined);

let somaValorCentavos = 0;
for (const parcela of parcelasGeradas) {
  somaValorCentavos += parcela.valorCentavos;
}

verificar(
  "a soma dos valorCentavos bate com o total",
  somaValorCentavos === contratoFotografo.totalCentavos,
);

verificar(
  `formatarCentavos(1750000) retornou: ${formatarCentavos(1750000)} (esperado: R$ 17.500,00)`,
  formatarCentavos(1750000) === "R$ 17.500,00",
);

verificar(
  `formatarCentavos(291667) retornou: ${formatarCentavos(291667)} (esperado: R$ 2.916,67)`,
  formatarCentavos(291667) === "R$ 2.916,67",
);

verificar(
  `formatarCentavos(5) retornou: ${formatarCentavos(5)} (esperado: R$ 0,05)`,
  formatarCentavos(5) === "R$ 0,05",
);

verificar(
  "Total de 1750000 dividido em 6 parcelas deve somarCentavos 1750000",
  somarCentavos(dividirEmParcelas(1750000, 6)) === 1750000,
);
verificar(
  "Total de 1750000 dividido em 6 parcelas deve gerar um array com 6 posições",
  dividirEmParcelas(1750000, 6).length === 6,
);
const parc = dividirEmParcelas(1750000, 6);

if (parc[0] && parc[5]) {
  verificar(
    "Total de 1750000 dividido em 6 parcelas: primeira parcela deve ser maior que a última",
    parc[0] > parc[5]
  );
}

verificar(
  "Total de 1200000 dividido em 6 parcelas deve somarCentavos 1200000",
  somarCentavos(dividirEmParcelas(1200000, 6)) === 1200000,
);
verificar(
  "Total de 100 dividido em 3 parcelas deve somarCentavos 100",
  somarCentavos(dividirEmParcelas(100, 3)) === 100,
);
verificar(
  "Total de 1 dividido em 1 parcela deve somarCentavos 1",
  somarCentavos(dividirEmParcelas(1, 1)) === 1,
);
verificar(
  "Total de 10 dividido em 10 parcelas deve somarCentavos 10",
  somarCentavos(dividirEmParcelas(10, 10)) === 10,
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
