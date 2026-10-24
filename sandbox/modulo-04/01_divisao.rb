# frozen_string_literal: true

supplier_value = 17_500_00
installments_number = 27

base_installments_value = supplier_value / installments_number
remain_value = supplier_value % installments_number

puts base_installments_value
puts remain_value
puts ((base_installments_value * installments_number) + remain_value) == supplier_value
