import { gerarParcelas } from "./money.ts";

import type { Contrato } from "./types/contrato.ts";
import { Money } from "./money/money.ts";
import { quantidadeParcelas } from "./types/quantidadeParcelas.ts";

const contratoFotografo: Contrato = {
  nome: "Gauss",
  total: Money.deCentavos(390000),
  quantidadeParcelas: quantidadeParcelas(20),
};
("");

function verificar(descricao: string, condicao: boolean): void {
  if (condicao) {
    console.log("OK", descricao);
  } else {
    console.log("FALHOU", descricao);
  }
}

function verificarErro(descricao: string, fn: () => void): void {
  try {
    fn();
    console.log("FALHOU", descricao);
  } catch (e) {
    if (e instanceof Error) {
      console.log("OK", e.message, "com descrição de:", descricao);
    } else {
      console.log("OK", String(e));
    }
  }
}
const status: number = 1;
verificar("Calibração verdadeira: deve imprimir OK", status === 1);
verificar("Calibração falsa: deve imprimir FALHOU", status === 2);

const parcelasGeradas = gerarParcelas(contratoFotografo);

verificar(
  "gerarParcelas devolve a quantidade certa de objetos",
  parcelasGeradas.length === contratoFotografo.quantidadeParcelas,
);

const primeira = parcelasGeradas[0];
const ultima = parcelasGeradas.at(-1);

if (primeira === undefined || ultima === undefined)
  throw new Error(
    `parcelasGeradas são undefined. Parcelas: ${JSON.stringify(parcelasGeradas)}`,
  );

verificar("a primeira tem quantidadeParcelas igual a 1", primeira.numero === 1);
verificar(
  "a última tem quantidadeParcelas igual ao número de parcelas",
  ultima.numero === contratoFotografo.quantidadeParcelas,
);

let somaValorCentavos = Money.deCentavos(0);

for (const parcela of parcelasGeradas) {
  somaValorCentavos = somaValorCentavos.somar(parcela.valorCentavos);
}

verificar(
  "a soma dos valorCentavos bate com o total",
  somaValorCentavos.igualA(contratoFotografo.total),
);
somaValorCentavos = Money.deCentavos(1750000);
verificar(
  `formatarCentavos(1750000) retornou: ${somaValorCentavos.formatar()} (esperado: R$ 17.500,00)`,
  somaValorCentavos.formatar() === "R$ 17.500,00",
);
somaValorCentavos = Money.deCentavos(291667);
verificar(
  `formatarCentavos(291667) retornou: ${somaValorCentavos.formatar()} (esperado: R$ 2.916,67)`,
  somaValorCentavos.formatar() === "R$ 2.916,67",
);
somaValorCentavos = Money.deCentavos(5);
verificar(
  `formatarCentavos(5) retornou: ${somaValorCentavos.formatar()} (esperado: R$ 0,05)`,
  somaValorCentavos.formatar() === "R$ 0,05",
);
somaValorCentavos = Money.deCentavos(1750000);

function somarMoney(parcelas: Money[]): Money {
  return parcelas.reduce((acc, p) => acc.somar(p), Money.deCentavos(0));
}

verificar(
  "Total de 1750000 dividido em 6 parcelas deve somar 1750000",
  somarMoney(somaValorCentavos.dividirEmParcelas(quantidadeParcelas(6))).igualA(
    Money.deCentavos(150000),
  ),
);

verificar(
  "Total de 1750000 dividido em 6 parcelas deve gerar um array com 6 posições",
  somaValorCentavos.dividirEmParcelas(quantidadeParcelas(6)).length === 6,
);
const parc = somaValorCentavos.dividirEmParcelas(quantidadeParcelas(6));

if (parc[0] && parc[5]) {
  verificar(
    "Total de 1750000 dividido em 6 parcelas: primeira parcela deve ser maior que a última",
    parc[0].maiorQue(parc[5]),
  );
}

verificar(
  "Total de 100 dividido em 3 parcelas deve somar 100",
  somarMoney(
    Money.deCentavos(100).dividirEmParcelas(quantidadeParcelas(3)),
  ).igualA(Money.deCentavos(100)),
);
verificar(
  "Total de 1 dividido em 1 parcela deve somar 1",
  somarMoney(
    Money.deCentavos(1).dividirEmParcelas(quantidadeParcelas(1)),
  ).igualA(Money.deCentavos(1)),
);
verificar(
  "Total de 10 dividido em 10 parcelas deve somar 10",
  somarMoney(
    Money.deCentavos(1).dividirEmParcelas(quantidadeParcelas(1)),
  ).igualA(Money.deCentavos(1)),
);

verificarErro("parcelas negativas", () =>
  Money.deCentavos(10).dividirEmParcelas(quantidadeParcelas(-1)),
);
verificarErro("total em centavos negativo", () =>
  Money.deCentavos(100).dividirEmParcelas(quantidadeParcelas(5)),
);
verificarErro("valor não inteiro para parcelas", () =>
  Money.deCentavos(10).dividirEmParcelas(quantidadeParcelas(2.5)),
);
verificarErro(
  "total menor que o número de parcelas (5 centavos em 10 parcelas)",
  () => Money.deCentavos(5).dividirEmParcelas(quantidadeParcelas(10)),
);
verificarErro("zero parcelas", () =>
  Money.deCentavos(10).dividirEmParcelas(quantidadeParcelas(0)),
);

const inicial = Money.deCentavos(10);
const depois = inicial.somar(Money.deCentavos(20));

verificar("somar devolve o valor somado", depois.igualA(Money.deCentavos(30)));
verificar("marcar não altera o placar original", inicial.igualA(depois));
