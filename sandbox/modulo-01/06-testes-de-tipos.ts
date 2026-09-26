import { dividirEmParcelas } from "./money.ts";
import { QuantidadeParcelas } from "./types/quantidadeParcelas.ts";
import { Centavos } from "./types/centavos.ts";

// @ts-expect-error ordem invertida: quantidade onde se espera total
dividirEmParcelas(QuantidadeParcelas(20), Centavos(390000));

// @ts-expect-error reais crus não entram onde se espera Centavos
dividirEmParcelas(2000, QuantidadeParcelas(20));