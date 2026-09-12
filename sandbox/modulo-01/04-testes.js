import { dividirEmParcelas, somar } from "./01-money.js";

function verificar(descricao, condicao) {}

function verificarErro(descricao, fn) {
  try {
    fn(1750000, 6);
    fn(1200000, 6);
    fn(100, 3);
    fn(1, 1);
    fn(10, 10);
    fn(10, -1);
    fn(-100, 5);
    fn(10, 2.5);

    verificar("FALHOU!", e);
  } catch (e) {
    verificar("OK", e);
  }
}

console.log(
  verificarErro("cinco centavos em dez parcelas", () =>
    dividirEmParcelas(5, 10),
  ),
);
/**verificar(descricao, condicao) — imprime a descrição junto com OK ou FALHOU, 
conforme a condição.
verificarErro(descricao, fn) — recebe uma função, executa dentro de um try/catch, 
e imprime OK se ela estourou um erro (junto com a mensagem capturada) ou FALHOU se 
ela não estourou. Pra passar uma função como argumento sem executá-la na hora, você 
a envolve: verificarErro("cinco centavos em dez parcelas", () => dividirEmParcelas(5, 10)). 
Aquele () => cria uma função anônima que só roda quando 
alguém chamar — a gente aprofunda isso na próxima aula. */
