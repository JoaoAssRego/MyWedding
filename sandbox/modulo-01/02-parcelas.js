function valorBaseParcela(totalCentavos, numeroParcelas) {
  return Math.floor(totalCentavos / numeroParcelas);
}

function centavosRestantes(totalCentavos, numeroParcelas) {
  return Math.floor(totalCentavos % numeroParcelas);
}

console.log("\n=== TESTE 1: Divisão exata (1.200.000 em 6) ===");
let total1 = 1200000;
let parcelas1 = 6;
let resultado1 =
  valorBaseParcela(total1, parcelas1) * parcelas1 +
    centavosRestantes(total1, parcelas1) ===
  total1;
console.log(`Total: ${total1}, Parcelas: ${parcelas1}`);
console.log(`Valor base: R$ ${valorBaseParcela(total1, parcelas1)}`);
console.log(`Centavos restantes: ${centavosRestantes(total1, parcelas1)}`);
console.log(`Resultado: ${resultado1}`);

console.log("\n=== TESTE 2: Parcelas > total (5 centavos em 10 parcelas) ===");
let total2 = 5;
let parcelas2 = 10;
let resultado2 =
  valorBaseParcela(total2, parcelas2) * parcelas2 +
    centavosRestantes(total2, parcelas2) ===
  total2;
console.log(`Total: ${total2}, Parcelas: ${parcelas2}`);
console.log(`Valor base: R$ ${valorBaseParcela(total2, parcelas2)}`);
console.log(`Centavos restantes: ${centavosRestantes(total2, parcelas2)}`);
console.log(`Resultado: ${resultado2}`);

// Teste 3: 1 centavo em 1 parcela
console.log("\n=== TESTE 3: Mínimo (1 centavo em 1 parcela) ===");
let total3 = 1;
let parcelas3 = 1;
let resultado3 =
  valorBaseParcela(total3, parcelas3) * parcelas3 +
    centavosRestantes(total3, parcelas3) ===
  total3;
console.log(`Total: ${total3}, Parcelas: ${parcelas3}`);
console.log(`Valor base: R$ ${valorBaseParcela(total3, parcelas3)}`);
console.log(`Centavos restantes: ${centavosRestantes(total3, parcelas3)}`);
console.log(`Resultado: ${resultado3}`);

// Esses centavos restantes seriam distribuidos entre as parcelas, para assim não ficarmos devendo.
