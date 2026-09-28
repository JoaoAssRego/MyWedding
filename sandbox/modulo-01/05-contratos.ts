import { gerarParcelas } from "./money.ts";
import { quantidadeParcelas } from "./types/quantidadeParcelas.ts";
import { Money } from "./money/money.ts";

import type { Contrato } from "./types/contrato.ts";

const contratoSalao = {
  nome: "Casarão do Paraiso",
  total: Money.deCentavos(1750000),
  quantidadeParcelas: quantidadeParcelas(27),
};

const contratoFotografo = {
  nome: "Gauss",
  total: Money.deCentavos(390000),
  quantidadeParcelas: quantidadeParcelas(20),
};

function exibirRelatorio(contrato: Contrato) {
  const parcelas = gerarParcelas(contrato);
  const somaParcelas = parcelas.reduce(
    (acc, parcela) => acc.somar(parcela.valorCentavos),
    Money.deCentavos(0),
  );
  for (const parcela of parcelas) {
    console.log(
      `${contrato.nome} - parcela ${parcela.numero}/${parcelas.length}: ${parcela.valorCentavos.formatar()}`,
    );
  }

  console.log(`\n--- Resumo: ${contrato.nome} ---`);
  console.log(`Total do contrato: ${contrato.total.formatar()}`);
  console.log(`Soma das parcelas: ${somaParcelas.formatar()}`);
  console.log(
    `Conferência: A soma ${somaParcelas.igualA(contrato.total) ? "BATE" : "NÃO BATE"} com o total!\n`,
  );
}

exibirRelatorio(contratoSalao);
exibirRelatorio(contratoFotografo);
