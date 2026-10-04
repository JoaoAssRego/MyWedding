import { Contrato } from "./contrato/contrato.js";
import { Money } from "./money/money.js";
import { quantidadeParcelas } from "./types/quantidadeParcelas.js";

export function exibirRelatorio(contrato: Contrato) {
  const parcelas = contrato.gerarParcelas();
  const somaParcelas = parcelas.reduce(
    (acc, parcela) => acc.somar(parcela.valor),
    Money.deCentavos(0),
  );
  for (const parcela of parcelas) {
    console.log(
      `${contrato.getNome()} - parcela ${parcela.numero}/${parcelas.length}: ${parcela.valor.formatar()}`,
    );
  }

  console.log(`\n--- Resumo: ${contrato.getNome()} ---`);
  console.log(`Total do contrato: ${contrato.getTotal().formatar()}`);
  console.log(`Soma das parcelas: ${somaParcelas.formatar()}`);
  console.log(
    `Conferência: A soma ${somaParcelas.igualA(contrato.getTotal()) ? "BATE" : "NÃO BATE"} com o total!\n`,
  );
}

const contratoSalao = new Contrato(
  "Casarão do Paraiso",
  Money.deCentavos(1750000),
  quantidadeParcelas(27),
);

const contratoFotografo = new Contrato(
  "Gauss",
  Money.deCentavos(390000),
  quantidadeParcelas(20),
);

exibirRelatorio(contratoSalao);
exibirRelatorio(contratoFotografo);
