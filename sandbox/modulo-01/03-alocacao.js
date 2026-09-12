function provar(totalCentavos, numeroParcelas) {
  let arrayParcelas = dividirEmParcelas(totalCentavos, numeroParcelas);

  return somar(arrayParcelas) === totalCentavos;
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
