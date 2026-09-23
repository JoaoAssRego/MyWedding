export type Centavos = number & { readonly __brand: "Centavos" };

export function Centavos(valor: number): Centavos {
    if (valor < 0 && !Number.isInteger(valor)) throw new Error("Valor deve ser maior que 0");

    return valor as Centavos;
}