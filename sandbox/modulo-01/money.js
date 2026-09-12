export function dividirEmParcelas(totalCentavos, numeroParcelas) {
  if (!(Number.isInteger(numeroParcelas) && numeroParcelas > 0)) {
    throw new Error(
      `Numero de Parcelas deve ser inteiro >= 1, recebido: ${numeroParcelas} `,
      numeroParcelas,
    );
  }

  if (!(Number.isInteger(totalCentavos) && totalCentavos >= 0)) {
    throw new Error(
      `Total em centavos deve ser inteiro >=0, recebido: ${totalCentavos} `,
      totalCentavos,
    );
  }

  if (numeroParcelas > totalCentavos) {
    throw new Error(
      `Total em centavos deve ser > numero de Parcelas, recebido: ${numeroParcelas} e ${totalCentavos}`,
    );
  }

  const valorParcelaCentavos = Math.floor(totalCentavos / numeroParcelas);
  let centavosRestantes = totalCentavos % numeroParcelas;
  const arrayParcelas = [];

  for (let i = 0; i < numeroParcelas; i++) {
    arrayParcelas.push(valorParcelaCentavos);
  }
  let i = 0;

  while (centavosRestantes !== 0) {
    arrayParcelas[i] += 1;
    centavosRestantes -= 1;
    i++;
  }

  return arrayParcelas;
}

export function somar(arrayParcelas) {
  let soma = 0;
  for (let i = 0; i < arrayParcelas.length; i++) {
    soma += arrayParcelas[i];
  }

  return soma;
}
