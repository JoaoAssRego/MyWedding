import { gerarParcelas, formatarCentavos } from "./money.js";

const contratosSalao = {
  nome: "Casarão do Paraiso",
  totalCentavos: 17500,
  numeroParcelas: 27,
};

const contratosFotografo = {
  nome: "Gauss",
  totalCentavos: 3900,
  numeroParcelas: 20,
};

const contratossSalao = gerarParcelas(contratosSalao);
const contratossFotografo = gerarParcelas(contratosFotografo);

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

exibirRelatorio(contratosSalao, contratossSalao);
exibirRelatorio(contratosFotografo, contratossFotografo);
