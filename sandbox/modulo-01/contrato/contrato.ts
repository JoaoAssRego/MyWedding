import type { QuantidadeParcelas } from "../types/quantidadeParcelas.ts";
import { Money } from "../money/money.ts";
import { type Parcela } from "../types/parcela.ts";

export class Contrato {
  #nome: string;
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

  public getNome(): string {
    return this.#nome;
  }

  public getTotal(): Money {
    return this.#total;
  }

  public getQuantidadeParcelas(): QuantidadeParcelas {
    return this.#quantidadeParcelas;
  }

  public gerarParcelas(): Array<Parcela> {
    const parcelas = this.#total.dividirEmParcelas(this.#quantidadeParcelas);
    const arrayObjectParcelas = parcelas.map((parcela, index) => ({
      numero: index + 1,
      valor: parcela,
    }));

    return arrayObjectParcelas;
  }
}
