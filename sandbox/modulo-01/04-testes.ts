import {
  gerarParcelas,
  dividirEmParcelas,
  formatarCentavos,
  somarCentavos,
} from "./money.ts";

import type { Contrato } from "./types/contrato.ts";
import { centavos } from "./types/centavos.ts";
import { quantidadeParcelas } from "./types/quantidadeParcelas.ts";

const contratoFotografo: Contrato = {
  nome: "Gauss",
  total: centavos(390000),
  quantidadeParcelas: quantidadeParcelas(20),
};

function verificar(descricao: string, condicao: boolean): void {
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
      console.log("OK", e.message, "com descrição de:", descricao);
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
  parcelasGeradas.length === contratoFotografo.quantidadeParcelas,
);

const primeira = parcelasGeradas[0];
const ultima = parcelasGeradas.at(-1);

if (primeira === undefined || ultima === undefined) throw new Error(`parcelasGeradas são undefined. Parcelas: ${JSON.stringify(parcelasGeradas)}`)

verificar("a primeira tem quantidadeParcelas igual a 1", primeira.numero === 1);
verificar(
  "a última tem quantidadeParcelas igual ao número de parcelas",
  ultima.numero === contratoFotografo.quantidadeParcelas,
);


let somaValorCentavos = 0;
for (const parcela of parcelasGeradas) {
  somaValorCentavos += parcela.valorCentavos;
}

verificar(
  "a soma dos valorCentavos bate com o total",
  somaValorCentavos === contratoFotografo.total,
);

verificar(
  `formatarCentavos(1750000) retornou: ${formatarCentavos(centavos(1750000))} (esperado: R$ 17.500,00)`,
  formatarCentavos(centavos(1750000)) === "R$ 17.500,00",
);

verificar(
  `formatarCentavos(291667) retornou: ${formatarCentavos(centavos(291667))} (esperado: R$ 2.916,67)`,
  formatarCentavos(centavos(291667)) === "R$ 2.916,67",
);

verificar(
  `formatarCentavos(5) retornou: ${formatarCentavos(centavos(5))} (esperado: R$ 0,05)`,
  formatarCentavos(centavos(5)) === "R$ 0,05",
);

verificar(
  "Total de 1750000 dividido em 6 parcelas deve somar 1750000",
  somarCentavos(dividirEmParcelas(centavos(1750000), quantidadeParcelas(6))) === 1750000,
);
verificar(
  "Total de 1750000 dividido em 6 parcelas deve gerar um array com 6 posições",
  dividirEmParcelas(centavos(1750000), quantidadeParcelas(6)).length === 6,
);
const parc = dividirEmParcelas(centavos(1750000), quantidadeParcelas(6));

if (parc[0] && parc[5]) {
  verificar(
    "Total de 1750000 dividido em 6 parcelas: primeira parcela deve ser maior que a última",
    parc[0] > parc[5]
  );
}

verificar(
  "Total de 1200000 dividido em 6 parcelas deve somar 1200000",
  somarCentavos(dividirEmParcelas(centavos(1200000), quantidadeParcelas(6))) === 1200000,
);
verificar(
  "Total de 100 dividido em 3 parcelas deve somar 100",
  somarCentavos(dividirEmParcelas(centavos(100), quantidadeParcelas(3))) === 100,
);
verificar(
  "Total de 1 dividido em 1 parcela deve somar 1",
  somarCentavos(dividirEmParcelas(centavos(1), quantidadeParcelas(1))) === 1,
);
verificar(
  "Total de 10 dividido em 10 parcelas deve somar 10",
  somarCentavos(dividirEmParcelas(centavos(10), quantidadeParcelas(10))) === 10,
);

verificarErro("parcelas negativas", () => dividirEmParcelas(centavos(10), quantidadeParcelas(-1)));
verificarErro("total em centavos negativo", () => dividirEmParcelas(centavos(-100), quantidadeParcelas(5)));
verificarErro("valor não inteiro para parcelas", () =>
  dividirEmParcelas(centavos(10), quantidadeParcelas(2.5)),
);
verificarErro(
  "total menor que o número de parcelas (5 centavos em 10 parcelas)",
  () => dividirEmParcelas(centavos(5), quantidadeParcelas(10)),
);
verificarErro("zero parcelas", () => dividirEmParcelas(centavos(10), quantidadeParcelas(0)));
