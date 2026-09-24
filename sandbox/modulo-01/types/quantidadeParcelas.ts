export type QuantidadeParcelas = number & { readonly __brand: "QuantidadeParcelas" }

export function QuantidadeParcelas(quantidade: number): QuantidadeParcelas {
    if (quantidade < 1 || !Number.isInteger(quantidade)) throw new Error("Quantidade de Parcelas deve ser maior ou igual a 1 e Inteiro")

    return quantidade as QuantidadeParcelas
}