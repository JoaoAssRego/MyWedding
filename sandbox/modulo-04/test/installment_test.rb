# frozen_string_literal: true

require 'minitest/autorun'
require_relative '../money'
require_relative '../contract'
require_relative '../sample_contracts'
# Test of installment
class InstallmentTest < Minitest::Test
  def setup
    @contract = SAMPLE_CONTRACTS[0]
    @installment_generated = @contract.installments
  end

  def test_installments_generated
    assert_equal @contract.installment_count, @installment_generated.size
  end

  def test_first_and_last_installments_have_expected_numbers
    assert_equal 1, @installment_generated.first.number
    assert_equal @contract.installment_count, @installment_generated.last.number
  end

  def test_sum_amount_installments_equal_total
    sum = @installment_generated.sum(Money.from_cents(0), &:amount)
    assert_equal @contract.total, sum
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
    assert_equal 'Number must be an Integer greater or equal to 1', error.message
  end

  def test_installment_amount_is_money
    error = assert_raises(ArgumentError) do
      Installment.new(1, 24)
    end
    assert_equal 'Amount must be Money', error.message
  end
end
