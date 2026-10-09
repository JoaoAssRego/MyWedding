import { servidor } from "./server.ts";
import { Contrato } from "../modulo-01/contrato/contrato.ts";
import { Money } from "../modulo-01/money/money.ts";
import { quantidadeParcelas } from "../modulo-01/types/quantidadeParcelas.ts";

const contratoSalao = new Contrato(
  "1",
  "Casarão do Paraiso",
  Money.deCentavos(1750000),
  quantidadeParcelas(27),
);

const contratoFotografo = new Contrato(
  "2",
  "Gauss",
  Money.deCentavos(390000),
  quantidadeParcelas(20),
);

export const contratos = [contratoSalao, contratoFotografo];

servidor.listen(3000, () => console.log("ouvindo na 3000"));
