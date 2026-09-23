import type { Contrato } from "./types/contrato.ts";
import type { Parcela } from "./types/parcela.ts";

export function dividirEmParcelas(
  totalCentavos: number,
  numeroParcelas: number,
): Array<number> {
  if (!(Number.isInteger(numeroParcelas) && numeroParcelas > 0)) {
    throw new Error(
      `Numero de Parcelas deve ser inteiro >= 1, recebido: ${numeroParcelas}`,
    );
  }

  if (!(Number.isInteger(totalCentavos) && totalCentavos >= 0)) {
    throw new Error(
      `Total em centavos deve ser inteiro >=0, recebido: ${totalCentavos}`,
    );
  }

  if (numeroParcelas > totalCentavos) {
    throw new Error(
      `Total em centavos deve ser > numero de Parcelas, recebido: Número de Parcelas =${numeroParcelas} e Total em Centavos=${totalCentavos}`,
    );
  }

  const valorParcelaCentavos: number = Math.floor(
    totalCentavos / numeroParcelas,
  );
  const centavosRestantes: number = totalCentavos % numeroParcelas;
  const arrayParcelas: Array<number> = [];

  for (let i = 0; i < numeroParcelas; i++) {
    arrayParcelas.push(valorParcelaCentavos + (i < centavosRestantes ? 1 : 0));
  }

  return arrayParcelas;
}
// Função trocou de nome, pois seu retorno representa a soma dos centavos do array de parcelas
export function somarCentavos(arrayParcelas: Array<number>): number {
  let soma = 0;

  for (const parcela of arrayParcelas) {
    soma += parcela;
  }
  return soma;
}

export function formatarCentavos(centavos: number): string {
  const formatador = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  return formatador.format(centavos / 100).replace(/\u00A0/g, " ");
}

export function gerarParcelas(contrato: Contrato): Array<Parcela> {
  const parcelas = dividirEmParcelas(
    contrato.totalCentavos,
    contrato.numeroParcelas,
  );
  const arrayObjectParcelas = parcelas.map((parcela, index) => ({
    numero: index + 1,
    valorCentavos: parcela,
  }));

  return arrayObjectParcelas;
}
