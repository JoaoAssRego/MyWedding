import type { QuantidadeParcelas } from "../types/quantidadeParcelas.ts";
import { Money } from "../money/money.ts";
import { type Parcela } from "../types/parcela.ts";

export class Contrato {
  #id: string;
  #nome: string;
  #total: Money;
  #quantidadeParcelas: QuantidadeParcelas;

  public constructor(
    id: string,
    nome: string,
    total: Money,
    quantidadeParcelas: QuantidadeParcelas,
  ) {
    this.#id = id;
    this.#nome = nome;
    this.#total = total;
    this.#quantidadeParcelas = quantidadeParcelas;
  }

  public getId(): string {
    return this.#id;
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

  public toJSON() {
    return {
      id: this.#id,
      nome: this.#nome,
      total: this.#total,
      quantidadeParcelas: this.#quantidadeParcelas,
    };
  }
}
