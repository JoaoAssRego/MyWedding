function provar(totalCentavos, numeroParcelas) {
  let arrayParcelas = dividirEmParcelas(totalCentavos, numeroParcelas);

  if (!(numeroParcelas === arrayParcelas.length)) {
    throw new Error("Número de parcelas diferente do tamanho do array!");
  }

  return somar(arrayParcelas) === totalCentavos;
}

/**
 1 - Essa politica é razoável, pois o sistema não paga nada e no final, a soma dos pagamento é igual ao total.
 2 - Não consigo pensar em outra razoável.
 */
