class Contract < ApplicationRecord
  def total
    Money.from_cents(total_cents)
  end

  def installments
    total.split(installment_count).map.with_index(1) do |amount, number|
      Installment.new(number: number, amount: amount)
    end
  end
end
