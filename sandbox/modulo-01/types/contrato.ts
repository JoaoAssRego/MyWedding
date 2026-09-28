import type { QuantidadeParcelas } from "./quantidadeParcelas.ts";
import { Money } from "../money/money.ts";

export interface Contrato {
  nome: string;
  total: Money;
  quantidadeParcelas: QuantidadeParcelas;
}
