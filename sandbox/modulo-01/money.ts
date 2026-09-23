import type { Contrato } from "./types/contrato.ts";
import type { Parcela } from "./types/parcela.ts";
import { QuantidadeParcelas } from "./types/quantidadeParcelas.ts";
import { Centavos } from "./types/centavos.ts";

export function dividirEmParcelas(
  total: Centavos,
  numero: QuantidadeParcelas,
): Array<Centavos> {

  if (numero > total) {
    throw new Error(
      `Total em centavos deve ser > numero de Parcelas, recebido: Número de Parcelas =${numero} e Total em Centavos=${total}`,
    );
  }

  const valorParcelaCentavos: number = Math.floor(
    total / numero,
  );
  const centavosRestantes: number = total % numero;
  const arrayParcelas: Array<Centavos> = [];

  for (let i = 0; i < numero; i++) {
    arrayParcelas.push(Centavos(valorParcelaCentavos + (i < centavosRestantes ? 1 : 0)));
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
    contrato.total,
    contrato.numero,
  );
  const arrayObjectParcelas = parcelas.map((parcela, index) => ({
    numero: index + 1,
    valorCentavos: parcela,
  }));

  return arrayObjectParcelas;
}
