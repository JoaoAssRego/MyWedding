valor_fornecedor = 17_500_000
numero_parcelas = 27

valor_base_parcela = valor_fornecedor / numero_parcelas
valor_sobra = valor_fornecedor % numero_parcelas

puts valor_base_parcela
puts valor_sobra
puts ((valor_base_parcela * numero_parcelas) + valor_sobra) == valor_fornecedor
