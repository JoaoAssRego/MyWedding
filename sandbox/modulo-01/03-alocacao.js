function dividirEmParcelas(totalCentavos, numeroParcelas) {
  if (!(Number.isInteger(numeroParcelas) && numeroParcelas >= 1)) {
    throw new Error("O número de parcelas deve ser inteiro e maior que zero");
  }

  if (!(Number.isInteger(totalCentavos) && totalCentavos >= 0)) {
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

  if (somar(arrayParcelas) === totalCentavos) {
    return true;
  }

  return false;
}

console.log(provar(1750000, 6));
console.log(provar(1200000, 6));
console.log(provar(100, 3));
console.log(provar(1, 1));
console.log(provar(10, 10));

console.log(dividirEmParcelas(5, 10));
console.log(dividirEmParcelas(0, 0));

/**
 1 - Essa politica é razoável, pois o sistema não paga nada e no final, a soma dos pagamento é igual ao total.
 2 - Não consigo pensar em outra razoável.
 */
