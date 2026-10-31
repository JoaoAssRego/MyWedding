# frozen_string_literal: true

require 'minitest/autorun'
require_relative '../money'
require_relative '../contract'
require_relative '../sample_contracts'
# Test of contract
class ContractTest < Minitest::Test
  def setup
    @contract = SAMPLE_CONTRACTS.first
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

    assert_equal 'Count must be greater than or equal to 1.', error.message
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

    assert_equal 'Count must be Integer.', error.message
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

  def test_installments_are_frozen
    assert @contract.installments.frozen?
  end

  def test_installments_cannot_be_modified
    assert_raises(FrozenError) do
      @contract.installments << Installment.new(number: 1, amount: Money.from_cents(1))
    end
  end

  def test_sample_contracts_are_frozen
    assert SAMPLE_CONTRACTS.frozen?
  end
end
