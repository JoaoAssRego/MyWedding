import type { QuantidadeParcelas } from "../types/quantidadeParcelas.ts";
import { Money } from "../money/money.ts";

export class Contrato {
  readonly #nome: string;
  #total: Money;
  #quantidadeParcelas: QuantidadeParcelas;

  public constructor(
    nome: string,
    total: Money,
    quantidadeParcelas: QuantidadeParcelas,
  ) {
    this.#nome = nome;
    this.#total = total;
    this.#quantidadeParcelas = quantidadeParcelas;
  }
}
