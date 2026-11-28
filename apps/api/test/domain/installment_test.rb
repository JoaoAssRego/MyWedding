# frozen_string_literal: true

require "test_helper"
# Test of installment
class InstallmentTest < Minitest::Test
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
    assert_equal "Number must be an Integer greater or equal to 1", error.message
  end

  def test_installment_number_must_be_an_integer
    error = assert_raises(ArgumentError) do
      Installment.new(2.5, Money.from_cents(24))
    end
    assert_equal "Number must be an Integer greater or equal to 1", error.message
  end

  def test_installment_amount_is_money
    error = assert_raises(ArgumentError) do
      Installment.new(1, 24)
    end
    assert_equal "Amount must be Money", error.message
  end
end
