# frozen_string_literal: true

Installment = Data.define(:number, :amount) do
  def initialize(number:, amount:)
    raise ArgumentError, 'Number must be a Integer greather or equal to 1' if number < 1
    raise ArgumentError, 'Amount must be Money' unless amount.is_a?(Money)

    super
  end
end
