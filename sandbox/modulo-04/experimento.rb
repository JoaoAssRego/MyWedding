valor_fornecedor = 1750000.0
numero_parcelas = 27

valor_base_parcela = valor_fornecedor / numero_parcelas
valor_sobra = valor_fornecedor % numero_parcelas

puts valor_base_parcela
puts valor_sobra
puts ((valor_base_parcela * numero_parcelas) + valor_sobra) == valor_fornecedor
