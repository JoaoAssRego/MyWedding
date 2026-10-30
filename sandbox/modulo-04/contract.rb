# frozen_string_literal: true

require_relative 'money'
require_relative 'installment'

# Contract of my wedding
class Contract
  attr_reader :id, :vendor, :total, :installment_count

  def initialize(id:, vendor:, total:, installment_count:)
    raise ArgumentError, 'Total must be Money' unless total.is_a?(Money)
    raise ArgumentError, 'Count of installment must be an Integer greater or equal to 1' if installment_count < 1

    @id = id
    @vendor = vendor
    @total = total
    @installment_count = installment_count

    freeze
  end

  def installments
    @total.split(@installment_count).map.with_index(1) do |amount, number|
      Installment.new(number: number, amount: amount)
    end
  end
end

puts Contract.new(
  id: 1,
  vendor: 'Casarão Paraíso',
  total: Money.from_cents(17_500_00),
  installment_count: 27
).installments
