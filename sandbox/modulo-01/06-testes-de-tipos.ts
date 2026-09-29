import { Money } from "./money/money.ts";

// @ts-expect-error passando money onde se espera quantidadeParcelas
Money.deCentavos(20).dividirEmParcelas(Money.deCentavos(90000));

// @ts-expect-error passando número negativo onde espera-se número maior que 0
Money.deCentavos(-9).dividirEmParcelas(quantidadeParcelas(20));

// @ts-expect-error
Money.deCentavos(100) * 2;
