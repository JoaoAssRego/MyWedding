import { gerarParcelas } from "./money.js";

const formatador = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

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
      `${contrato.nome} - parcela ${parcela.numero}/${parcelas.length}: ${formatador.format(parcela.valorCentavos)}`,
    );
  }
  
  console.log(`\n--- Resumo: ${contrato.nome} ---`);
  console.log(`Total do contrato: ${formatador.format(contrato.totalCentavos)}`);
  console.log(`Soma das parcelas: ${formatador.format(somaParcelas)}`);
  console.log(`Conferência: A soma ${somaParcelas === contrato.totalCentavos ? 'BATE' : 'NÃO BATE'} com o total!\n`);
}

exibirRelatorio(contratosSalao, contratossSalao);
exibirRelatorio(contratosFotografo, contratossFotografo);
