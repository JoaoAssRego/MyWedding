import { gerarParcelas, formatarCentavos } from "./money.ts";
import { Centavos } from "./types/centavos.ts";
import { QuantidadeParcelas } from "./types/quantidadeParcelas.ts";

import type { Contrato } from "./types/contrato.ts";
import type { Parcela } from "./types/parcela.ts";

const contratoSalao = {
  nome: "Casarão do Paraiso",
  total: Centavos(1750000),
  numero: QuantidadeParcelas(27),
};

const contratoFotografo = {
  nome: "Gauss",
  total: Centavos(390000),
  numero: QuantidadeParcelas(20),
};

const parcelasSalao = gerarParcelas(contratoSalao);
const parcelasFotografo = gerarParcelas(contratoFotografo);

function exibirRelatorio(contrato: Contrato, parcelas: Array<Parcela>) {
  let somaParcelas = 0;
  for (const parcela of parcelas) {
    somaParcelas += parcela.valorCentavos;
    console.log(
      `${contrato.nome} - parcela ${parcela.numero}/${parcelas.length}: ${formatarCentavos(parcela.valorCentavos)}`,
    );
  }

  console.log(`\n--- Resumo: ${contrato.nome} ---`);
  console.log(`Total do contrato: ${formatarCentavos(contrato.total)}`);
  console.log(`Soma das parcelas: ${formatarCentavos(Centavos(somaParcelas))}`);
  console.log(
    `Conferência: A soma ${somaParcelas === contrato.total ? "BATE" : "NÃO BATE"} com o total!\n`,
  );
}

exibirRelatorio(contratoSalao, parcelasSalao);
exibirRelatorio(contratoFotografo, parcelasFotografo);
