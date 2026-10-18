supplier_value = 1750000
number_installments = 27

base_installments_value = valor_fornecedor / numero_parcelas
remain_value = valor_fornecedor % numero_parcelas

puts base_installments_value
puts remain_value
puts ((base_installments_value * number_installments) + remain_value) == supplier_value
