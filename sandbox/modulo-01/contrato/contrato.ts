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

  public exibirRelatorio() {
    const parcelas = this.gerarParcelas();
    const somaParcelas = parcelas.reduce(
      (acc, parcela) => acc.somar(parcela.valor),
      Money.deCentavos(0),
    );
    for (const parcela of parcelas) {
      console.log(
        `${this.#nome} - parcela ${parcela.numero}/${parcelas.length}: ${parcela.valor.formatar()}`,
      );
    }

    console.log(`\n--- Resumo: ${this.#nome} ---`);
    console.log(`Total do contrato: ${this.#total.formatar()}`);
    console.log(`Soma das parcelas: ${somaParcelas.formatar()}`);
    console.log(
      `Conferência: A soma ${somaParcelas.igualA(this.#total) ? "BATE" : "NÃO BATE"} com o total!\n`,
    );
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
