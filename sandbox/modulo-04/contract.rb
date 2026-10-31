# frozen_string_literal: true

require_relative 'money'
require_relative 'installment'

# Contract of my wedding
class Contract
  attr_reader :id, :vendor, :total, :installment_count, :installments

  def initialize(id:, vendor:, total:, installment_count:)
    raise ArgumentError, 'Total must be Money' unless total.is_a?(Money)

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
end
