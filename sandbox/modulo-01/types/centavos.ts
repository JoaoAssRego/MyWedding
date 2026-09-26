export type Centavos = number & { readonly __brand: "Centavos" };

export function centavos(valor: number): Centavos {
    if (valor < 0 || !Number.isInteger(valor)) throw new Error("Valor deve ser maior ou igual a 0 e Inteiro");

    return valor as Centavos;
}