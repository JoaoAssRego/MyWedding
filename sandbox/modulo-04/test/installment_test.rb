# frozen_string_literal: true

require 'minitest/autorun'
require_relative '../money'
require_relative '../contract'
require_relative '../sample_contracts'
# Test of installment
class InstallmentTest < Minitest::Test
  def setup
    @contrato = SAMPLE_CONTRACTS[0]
    @installment_generated = @contrato.installments
  end

  def test_contract_exists
    refute_nil @contrato, 'Contract must be defined'
  end

  def test_installments_generated
    assert_equal @installment_generated.size, @contrato.installment_count
  end

  def test_first_and_last_installments_have_expected_numbers
    assert_equal 1, @installment_generated[0].number
    assert_equal 27, @installment_generated[26].number
  end

  def test_sum_amount_installments_equal_total
    sum = @installment_generated.sum(Money.from_cents(0), &:amount)
    assert_equal @contrato.total, sum
  end

  def test_same_installments_equal_installments
    first = Installment.new(2, Money.from_cents(30))
    second = Installment.new(2, Money.from_cents(30))

    assert_equal first, second
  end

  def test_installment_frozen
    installment = Installment.new(2, Money.from_cents(24))
    assert installment.frozen?
  end

  def test_installment_number_less_than_one
    error = assert_raises(ArgumentError) do
      Installment.new(0, Money.from_cents(24))
    end
    assert_equal 'Number must be a Integer greather or equal to 1', error.message
  end

  def test_installment_amount_is_money
    error = assert_raises(ArgumentError) do
      Installment.new(1, 24)
    end
    assert_equal 'Amount must be Money', error.message
  end
end
