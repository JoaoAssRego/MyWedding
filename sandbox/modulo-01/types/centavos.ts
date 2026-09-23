type centavos = number & { readonly __brand: "Centavos" };

export function Centavos(valor: number): centavos {
    if (valor < 0) throw new Error("Valor deve ser maior que 0");

    return valor as centavos;
}