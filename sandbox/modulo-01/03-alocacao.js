function dividirEmParcelas(totalCentavos, numeroParcelas) {
  if (!(Number.isInteger(numeroParcelas) && numeroParcelas > 1)) {
    throw new Error("O número de parcelas deve ser inteiro e maior que zero");
  }

  if (!(Number.isInteger(totalCentavos) && totalCentavos > 0)) {
    throw new Error("O número de centavos deve ser inteiro e maior que zero");
  }

  if (numeroParcelas > totalCentavos) {
    throw new Error(
      "Numero totalcentavos deve ser maior que o número de parcelas",
    );
  }

  let valorParcela = totalCentavos / numeroParcelas;
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

function somar(arrayParcelas) {
  let soma = 0;
  for (let i = 0; i < arrayParcelas.length; i++) {
    soma += arrayParcelas[i];
  }

  return soma;
}

function provar(totalCentavos, numeroParcelas) {
  let arrayParcelas = dividirEmParcelas(totalCentavos, numeroParcelas);

  if (soma(arrayParcelas) === totalCentavos) {
    return true;
  }

  return false;
}

console.log(provar(1750000, 6));
console.log(provar(1200000, 6));
console.log(provar(100, 3));
console.log(provar());
