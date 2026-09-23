type quantidadeParcela = number & { readonly __brand: "QuantidadeParcela" }

export function quantidadeParcela(quantidade: number) {
    if (quantidade < 1) throw new Error("Quantidade de Parcelas deve ser maior ou igual a 1")

    return quantidade as quantidadeParcela
}