import { Money } from "../money/money.ts";
import { centavos } from "../types/centavos.ts";

// @ts-expect-error passando money onde se espera quantidadeParcelas
Money.deCentavos(20).dividirEmParcelas(Money.deCentavos(90000));

// @ts-expect-error number cru não entra onde se espera QuantidadeParcelas (tipo marcado)
Money.deCentavos(1000).dividirEmParcelas(6);
// @ts-expect-error construtor é privado, criação só permitida via método estático deCentavos
new Money(centavos(100));

// @ts-expect-error Não é possível multiplicar um valor da classe Money usando number
Money.deCentavos(100) * 2;
