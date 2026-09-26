import {
  gerarParcelas,
  dividirEmParcelas,
  formatarCentavos,
  somarCentavos,
} from "./money.ts";

import type { Contrato } from "./types/contrato.ts";
import { Centavos } from "./types/centavos.ts";
import { QuantidadeParcelas } from "./types/quantidadeParcelas.ts";

const contratoFotografo: Contrato = {
  nome: "Gauss",
  total: Centavos(390000),
  numero: QuantidadeParcelas(20),
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
  parcelasGeradas.length === contratoFotografo.numero,
);

const primeira = parcelasGeradas[0];
const ultima = parcelasGeradas.at(-1);

if (primeira === undefined || ultima === undefined) throw new Error(`parcelasGeradas são undefined. Parcelas: ${JSON.stringify(parcelasGeradas)}`)

verificar("a primeira tem numero igual a 1", primeira.numero === 1);
verificar(
  "a última tem numero igual ao número de parcelas",
  ultima.numero === contratoFotografo.numero,
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
  `formatarCentavos(1750000) retornou: ${formatarCentavos(Centavos(1750000))} (esperado: R$ 17.500,00)`,
  formatarCentavos(Centavos(1750000)) === "R$ 17.500,00",
);

verificar(
  `formatarCentavos(291667) retornou: ${formatarCentavos(Centavos(291667))} (esperado: R$ 2.916,67)`,
  formatarCentavos(Centavos(291667)) === "R$ 2.916,67",
);

verificar(
  `formatarCentavos(5) retornou: ${formatarCentavos(Centavos(5))} (esperado: R$ 0,05)`,
  formatarCentavos(Centavos(5)) === "R$ 0,05",
);

verificar(
  "Total de 1750000 dividido em 6 parcelas deve somar 1750000",
  somarCentavos(dividirEmParcelas(Centavos(1750000), QuantidadeParcelas(6))) === 1750000,
);
verificar(
  "Total de 1750000 dividido em 6 parcelas deve gerar um array com 6 posições",
  dividirEmParcelas(Centavos(1750000), QuantidadeParcelas(6)).length === 6,
);
const parc = dividirEmParcelas(Centavos(1750000), QuantidadeParcelas(6));

if (parc[0] && parc[5]) {
  verificar(
    "Total de 1750000 dividido em 6 parcelas: primeira parcela deve ser maior que a última",
    parc[0] > parc[5]
  );
}

verificar(
  "Total de 1200000 dividido em 6 parcelas deve somar 1200000",
  somarCentavos(dividirEmParcelas(Centavos(1200000), QuantidadeParcelas(6))) === 1200000,
);
verificar(
  "Total de 100 dividido em 3 parcelas deve somar 100",
  somarCentavos(dividirEmParcelas(Centavos(100), QuantidadeParcelas(3))) === 100,
);
verificar(
  "Total de 1 dividido em 1 parcela deve somar 1",
  somarCentavos(dividirEmParcelas(Centavos(1), QuantidadeParcelas(1))) === 1,
);
verificar(
  "Total de 10 dividido em 10 parcelas deve somar 10",
  somarCentavos(dividirEmParcelas(Centavos(10), QuantidadeParcelas(10))) === 10,
);

verificarErro("parcelas negativas", () => dividirEmParcelas(Centavos(10), QuantidadeParcelas(-1)));
verificarErro("total em centavos negativo", () => dividirEmParcelas(Centavos(-100), QuantidadeParcelas(5)));
verificarErro("valor não inteiro para parcelas", () =>
  dividirEmParcelas(Centavos(10), QuantidadeParcelas(2.5)),
);
verificarErro(
  "total menor que o número de parcelas (5 centavos em 10 parcelas)",
  () => dividirEmParcelas(Centavos(5), QuantidadeParcelas(10)),
);
verificarErro("zero parcelas", () => dividirEmParcelas(Centavos(10), QuantidadeParcelas(0)));
