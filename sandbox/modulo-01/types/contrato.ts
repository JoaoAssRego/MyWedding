import type { QuantidadeParcelas } from "./quantidadeParcelas.ts";
import type { Centavos } from "./centavos.ts";

export interface Contrato {
  nome: string;
  total: Centavos;
  quantidadeParcelas: QuantidadeParcelas;
}
