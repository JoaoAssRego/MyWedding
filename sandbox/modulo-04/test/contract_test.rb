# frozen_string_literal: true

require 'minitest/autorun'
require_relative '../money'
require_relative '../contract'
require_relative '../sample_contracts'
# Test of installment
class ContractTest < Minitest::Test
  def setup
    @contrato = SAMPLE_CONTRACTS[0]
    @installment_generated = @contrato.installments
  end

  def test_total_is_not_money
    error = assert_raises(ArgumentError) do
      Contract.new(
        id: 1,
        vendor: 'Casarão do Paraiso',
        total: 17_500_00,
        installment_count: 27
      )
    end

    assert_equal 'Total must be Money', error.message
  end

  def test_installments_count_less_than_one
    error = assert_raises(ArgumentError) do
      Contract.new(
        id: 1,
        vendor: 'Casarão do Paraiso',
        total: Money.from_cents(17_500_00),
        installment_count: 0
      )
    end

    assert_equal 'Count of installment must be an Integer greater or equal to 1', error.message
  end

  def test_installment_count_is_not_integer
    error = assert_raises(ArgumentError) do
      Contract.new(
        id: 1,
        vendor: 'Casarão do Paraiso',
        total: Money.from_cents(17_500_00),
        installment_count: 22.5
      )
    end

    assert_equal 'Count of installment must be an Integer greater or equal to 1', error.message
  end

  def test_installment_count_greater_than_total
    error = assert_raises(ArgumentError) do
      Contract.new(
        id: 1,
        vendor: 'Casarão do Paraiso',
        total: Money.from_cents(19),
        installment_count: 20
      )
    end
    assert_equal 'total cents need to be greater than count', error.message
  end
end
