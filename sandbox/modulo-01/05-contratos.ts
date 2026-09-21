import { gerarParcelas, formatarCentavos } from "./money.ts";

const contratoSalao = {
  nome: "Casarão do Paraiso",
  totalCentavos: 1750000,
  numeroParcelas: 27,
};

const contratoFotografo = {
  nome: "Gauss",
  totalCentavos: 390000,
  numeroParcelas: 20,
};

const parcelasSalao = gerarParcelas(contratoSalao);
const parcelasFotografo = gerarParcelas(contratoFotografo);

function exibirRelatorio(contrato, parcelas) {
  let somaParcelas = 0;
  for (const parcela of parcelas) {
    somaParcelas += parcela.valorCentavos;
    console.log(
      `${contrato.nome} - parcela ${parcela.numero}/${parcelas.length}: ${formatarCentavos(parcela.valorCentavos)}`,
    );
  }

  console.log(`\n--- Resumo: ${contrato.nome} ---`);
  console.log(`Total do contrato: ${formatarCentavos(contrato.totalCentavos)}`);
  console.log(`Soma das parcelas: ${formatarCentavos(somaParcelas)}`);
  console.log(
    `Conferência: A soma ${somaParcelas === contrato.totalCentavos ? "BATE" : "NÃO BATE"} com o total!\n`,
  );
}

exibirRelatorio(contratoSalao, parcelasSalao);
exibirRelatorio(contratoFotografo, parcelasFotografo);
