valorFornecedor = 1750000
numeroParcelas = 27

valorBase = valorFornecedor / numeroParcelas
valorSobra = valorFornecedor % numeroParcelas


puts valorBase
puts valorSobra
puts ((valorBase * numeroParcelas) + valorSobra) == 1750000
