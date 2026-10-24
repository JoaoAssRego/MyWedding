def installment_status(paid_cents, amount_cents)
  paid = paid_cents || 0
  validate_payment!(paid, amount_cents)

  if paid_cents.zero?
    :pending
  elsif paid_cents < amount_cents
    :partial
  else
    :paid
  end
end

def validate_payment!(paid, amount_cents)
  raise ArgumentError, 'Negative payment submitted; amount must be positive' if paid.negative?
  raise ArgumentError, 'Payment exceeds the installment amount' if paid_cents && paid > amount_cents
end

def paid?(paid_cents, amount_cents)
  installment_status(paid_cents, amount_cents) == :paid
end

p installment_status(nil, 64_815)    # => :pending
p installment_status(0, 64_815)      # => :pending
p installment_status(30_000, 64_815)  # => :partial
p installment_status(64_815, 64_815)  # => :paid

begin
  p installment_status(-100, 64_815)
rescue ArgumentError => e
  p e
end
p paid?(64_815, 64_815)               # => true
p paid?(30_000, 64_815)               # => false

begin
  installment_status(70_000, 64_815)
rescue ArgumentError => e
  p e # => ArgumentError
end
