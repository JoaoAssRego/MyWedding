valorFornecedor = 1750000.0
numeroParcelas = 27

valorBaseParcela = valorFornecedor / numeroParcelas
valorSobra = valorFornecedor % numeroParcelas

puts valorBaseParcela
puts valorSobra
puts ((valorBaseParcela * numeroParcelas) + valorSobra) == 1750000

