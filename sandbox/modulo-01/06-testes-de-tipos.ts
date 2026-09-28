import { quantidadeParcelas } from "./types/quantidadeParcelas.ts";
import { centavos } from "./types/centavos.ts";
import { Money } from "./money/money.ts";

// @ts-expect-error ordem invertida: quantidade onde se espera total
dividirEmParcelas(quantidadeParcelas(20), centavos(390000));

// @ts-expect-error reais crus não entram onde se espera Centavos
dividirEmParcelas(2000, QuantidadeParcelas(20));

// @ts-expect-error
Money.deCentavos(100) * 2;
