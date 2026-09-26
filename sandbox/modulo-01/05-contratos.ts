import { gerarParcelas, formatarCentavos, somarCentavos } from "./money.ts";
import { centavos } from "./types/centavos.ts";
import { quantidadeParcelas } from "./types/quantidadeParcelas.ts";

import type { Contrato } from "./types/contrato.ts";

const contratoSalao = {
  nome: "Casarão do Paraiso",
  total: centavos(1750000),
  quantidadeParcelas: quantidadeParcelas(27),
};

const contratoFotografo = {
  nome: "Gauss",
  total: centavos(390000),
  quantidadeParcelas: quantidadeParcelas(20),
};

function exibirRelatorio(contrato: Contrato) {
  const parcelas = gerarParcelas(contrato);
  const somaParcelas = somarCentavos(parcelas.map((parcela) => parcela.valorCentavos));
  for (const parcela of parcelas) {
    console.log(
      `${contrato.nome} - parcela ${parcela.numero}/${parcelas.length}: ${formatarCentavos(parcela.valorCentavos)}`,
    );
  }

  console.log(`\n--- Resumo: ${contrato.nome} ---`);
  console.log(`Total do contrato: ${formatarCentavos(contrato.total)}`);
  console.log(`Soma das parcelas: ${formatarCentavos(centavos(somaParcelas))}`);
  console.log(
    `Conferência: A soma ${somaParcelas === contrato.total ? "BATE" : "NÃO BATE"} com o total!\n`,
  );
}

exibirRelatorio(contratoSalao);
exibirRelatorio(contratoFotografo);
