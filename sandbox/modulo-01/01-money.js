export function dividirEmParcelas(totalCentavos, numeroParcelas) {
  if (!(Number.isInteger(numeroParcelas) && numeroParcelas > 0)) {
    throw new Error("O número de parcelas deve ser inteiro e maior que zero");
  }

  if (!(Number.isInteger(totalCentavos) && totalCentavos >= 0)) {
    throw new Error(
      "O número de centavos deve ser inteiro e maior ou igual que zero",
    );
  }

  if (numeroParcelas > totalCentavos) {
    throw new Error("Numero total deve ser maior que o número de parcelas");
  }

  const valorParcelaCentavos = Math.floor(totalCentavos / numeroParcelas);
  let centavosRestantes = totalCentavos % numeroParcelas;
  const arrayParcelas = [];

  for (let i = 0; i < numeroParcelas; i++) {
    arrayParcelas.push(valorParcelaCentavos);
  }

  if (!(numeroParcelas === arrayParcelas.length)) {
    throw new Error("Número de parcelas diferente do tamanho do array!");
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
