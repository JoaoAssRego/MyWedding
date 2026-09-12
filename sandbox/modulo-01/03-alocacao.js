function dividirEmParcelas(totalCentavos, numeroParcelas) {
  const valorParcela = totalCentavos / numeroParcelas;
  let centavosRestantes = totalCentavos % numeroParcelas;
  let arrayParcelas = [];

  for (let i = 0; i < numeroParcelas; i++) {
    arrayParcelas.push(Math.floor(valorParcela));
  }

  let i = 0;

  while (centavosRestantes != 0) {
    arrayParcelas[i] += 1;
    centavosRestantes -= 1;
    i++;
  }

  return arrayParcelas;
}

console.log(dividirEmParcelas(175000, 6));
