def installment_status(paid_cents, amount_cents)
  raise ArgumentError, "Pagamento enviado como nulo, valor deve ser positivo e não nulo" if paid_cents.nil?

  raise ArgumentError, "Pagamento acima do valor da parcela" if paid_cents > amount_cents

  if paid_cents.zero?
    :pending
  elsif paid_cents < amount_cents && paid_cents > 0
    :partial
  else
    :paid
  end 

end

def paid?(paid_cents,amount_cents)
  installment_status(paid_cents,amount_cents) == :paid
end

p installment_status(nil, 64815)    # => :pending
# p installment_status(0, 64815)      # => :pending
# p installment_status(30000, 64815)  # => :partial
# p installment_status(64815, 64815)  # => :paid
# p paid?(64815, 64815)               # => true
# p paid?(30000, 64815)               # => false

# begin
#   installment_status(70000, 64815)
# rescue ArgumentError => e
#   p e.class                         # => ArgumentError
# end
