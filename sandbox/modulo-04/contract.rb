# frozen_string_literal: true

require_relative 'money'
require_relative 'installment'

# Contract of my wedding
class Contract
  attr_reader :id, :vendor, :total, :installment_count, :installments

  def initialize(id:, vendor:, total:, installment_count:)
    validate_initialize

    @id = id
    @vendor = vendor
    @total = total
    @installment_count = installment_count
    @installments = build_installments.freeze

    freeze
  end

  private

  def build_installments
    @total.split(@installment_count).map.with_index(1) do |amount, number|
      Installment.new(number: number, amount: amount)
    end
  end

  def validade_initialize
    raise ArgumentError, 'Total must be Money' unless total.is_a?(Money)
    return if installment_count.is_a?(Integer) && installment_count >= 1

    raise ArgumentError,
          'Count of installment must be an Integer greater or equal to 1'
  end
end
