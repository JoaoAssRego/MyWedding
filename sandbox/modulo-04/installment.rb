# frozen_string_literal: true

Installment = Data.define(:number, :amount) do
  def initialize(number:, amount:)
    raise ArgumentError, 'Number must be an Integer greater or equal to 1' unless number.is_a?(Integer) && number >= 1
    raise ArgumentError, 'Amount must be Money' unless amount.is_a?(Money)

    super
  end
end
