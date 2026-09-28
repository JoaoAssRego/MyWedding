import { type Centavos, centavos } from "../types/centavos.ts";
import type { QuantidadeParcelas } from "../types/quantidadeParcelas.ts";

export class Money {
  private centavos: Centavos;

  private constructor(centavos: Centavos) {
    this.centavos = centavos;
  }

  /** Como o construtor é private, só é possível utiliza-lo 
        dentro da própria classe. Nisso surge o método deCentavos, 
        retornando o valor que precisamos.
    */
  public static deCentavos(valor: number): Money {
    return new Money(centavos(valor));
  }

  public somar(outro: Money): Money {
    return new Money(centavos(outro.centavos + this.centavos));
  }

  public subtrair(outro: Money): Money {
    return new Money(centavos(outro.centavos - this.centavos));
  }

  public dividirEmParcelas(quantidade: QuantidadeParcelas): Array<Money> {
    if (quantidade > this.centavos) {
      throw new Error(
        `Total em centavos deve ser > numero de Parcelas, recebido: Número de Parcelas =${quantidade} e Total em Centavos=${this.centavos}`,
      );
    }

    const valorParcelaCentavos: number = Math.floor(this.centavos / quantidade);
    const centavosRestantes: number = this.centavos % quantidade;
    const arrayParcelas: Array<Money> = [];

    for (let i = 0; i < quantidade; i++) {
      arrayParcelas.push(
        new Money(
          centavos(valorParcelaCentavos + (i < centavosRestantes ? 1 : 0)),
        ),
      );
    }

    return arrayParcelas;
  }
  public formatar(): string {
    const formatador = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return formatador.format(this.centavos / 100).replace(/\u00A0/g, " ");
  }

  public igualA(outro: Money): boolean {
    return this.centavos === outro.centavos;
  }

  public maiorQue(outro: Money): boolean {
    return this.centavos > outro.centavos;
  }
}
