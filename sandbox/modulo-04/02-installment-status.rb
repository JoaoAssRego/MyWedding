def installment_status(paid_cents, amount_cents)
  raise ArgumentError, "Negative payment submitted; amount must be positive" if paid_cents && paid_cents < 0

  raise ArgumentError, "Payment exceeds the installment amount" if paid_cents && paid_cents > amount_cents

  if paid_cents == nil || paid_cents.zero?
    :pending
  elsif paid_cents < amount_cents
    :partial
  else
    :paid
  end 

end

def paid?(paid_cents,amount_cents)
  installment_status(paid_cents,amount_cents) == :paid
end

p installment_status(nil, 64815)    # => :pending
p installment_status(0, 64815)      # => :pending
p installment_status(30000, 64815)  # => :partial
p installment_status(64815, 64815)  # => :paid

begin
p installment_status(-100,64815)
rescue ArgumentError => e
 p e
end
p paid?(64815, 64815)               # => true
p paid?(30000, 64815)               # => false

begin
  installment_status(70000, 64815)
rescue ArgumentError => e
  p e                      # => ArgumentError
end
