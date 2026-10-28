# frozen_string_literal: true

require 'minitest/autorun'
require_relative '../money'
# Class to test Money
class MoneyTest < Minitest::Test
  def setup
    @total = Money.from_cents(17_500_00)
    @parts = @total.split(27)
    @a = Money.from_cents(10)
    @b = Money.from_cents(20)
    @c = Money.from_cents(30)
  end

  def test_from_cents_keeps_the_amount
    assert_equal 17_500_00, @total.cents
  end

  def test_new_is_private
    refute_respond_to Money, :new
  end

  def test_from_cents_rejects_negative_cents
    error = assert_raises(ArgumentError) do
      Money.from_cents(-1)
    end

    assert_equal 'Cents must be a non-negative Integer', error.message
  end

  def test_from_cents_rejects_non_integer_cents
    error = assert_raises(ArgumentError) do
      Money.from_cents(1.5)
    end

    assert_equal 'Cents must be a non-negative Integer', error.message
  end

  def test_addition_returns_the_sum_without_changing_the_original
    assert_equal 30, (@a + @b).cents
    assert_equal 10, @a.cents
  end

  def test_subtraction_returns_the_difference
    assert_equal 10, (@b - @a).cents
  end

  def test_subtraction_rejects_negative_results
    error = assert_raises(ArgumentError) do
      @a - @b
    end

    assert_equal "Result Money can't be negative", error.message
  end

  def test_money_values_support_greater_than_and_less_than_comparisons
    assert_operator @b, :>, @a
    assert_operator @a, :<, @b
  end

  def test_equal_money_values_are_equal_but_not_the_same_object
    equal_value_a = Money.from_cents(10)
    equal_value_b = Money.from_cents(10)

    assert equal_value_a.eql?(equal_value_b)
    assert equal_value_a == equal_value_b
    refute equal_value_a.equal?(equal_value_b)
  end

  def test_money_is_not_equal_to_an_integer
    refute_equal @a, 10
  end

  def test_hash_equality_removes_duplicate_money_values
    assert_equal 1, [Money.from_cents(10), Money.from_cents(10)].uniq.size
  end

  def test_money_values_can_be_sorted_and_have_a_maximum
    assert_equal [@a, @b, @c], [@b, @a, @c].sort
    assert_equal @c, [@b, @a, @c].max
  end

  def test_money_instances_are_frozen
    assert @a.frozen?
  end

  def test_to_s_formats_cents_as_brazilian_currency
    assert @total.to_s == 'R$ 17.500,00' && Money.from_cents(2_916_67).to_s == 'R$ 2.916,67' &&
           Money.from_cents(5).to_s == 'R$ 0,05'
  end

  def test_adding_money_does_not_change_the_previous_value
    result = @a + @b

    assert_equal 30, result.cents
    assert_equal 10, @a.cents
    assert_equal 20, @b.cents
  end
end
