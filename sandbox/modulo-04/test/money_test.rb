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
    assert (@a + @b).cents == 30 && @a.cents == 10
  end

  def test_subtraction_returns_the_difference
    assert (@b - @a).cents == 10
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
    assert true, equal_value_a == equal_value_b
    refute equal_value_a.equal?(equal_value_b)
  end

  def test_money_is_not_equal_to_an_integer
    refute_equal @a, 10
  end

  def test_hash_equality_removes_duplicate_money_values
    assert [Money.from_cents(10), Money.from_cents(10)].uniq.size == 1
  end

  def test_money_values_can_be_sorted_and_have_a_maximum
    assert [@b, @a, @c].sort == [@a, @b, @c] && [@b, @a, @c].max == @c
  end

  def test_money_instances_are_frozen
    assert @a.frozen?
  end

  def test_split_returns_the_requested_number_of_money_values
    assert @parts.length == 27 && @parts.all?(Money)
  end

  def test_split_values_sum_to_the_original_total
    assert_equal @total, @parts.sum(Money.from_cents(0))
  end

  def test_split_puts_the_extra_cent_in_the_first_installments
    assert @parts.first.cents == 648_15 && @parts.last.cents == 648_14
  end

  def test_split_rejects_a_count_below_one
    error = assert_raises(ArgumentError) do
      @total.split(0)
    end

    assert_equal 'Count need to be greater than or equal to 1. Count: 0', error.message
  end

  def test_split_rejects_a_non_integer_count
    error = assert_raises(ArgumentError) do
      @total.split(-1)
    end
    assert_equal 'Count need to be greater than or equal to 1. Count: -1', error.message
  end

  def test_split_rejects_more_parts_than_cents
    error = assert_raises(ArgumentError) do
      @total.split(17_500_01)
    end

    assert_equal 'total cents need to be greater than count', error.message
  end

  def test_to_s_formats_cents_as_brazilian_currency
    assert_equal 'R$ 17.500,00', @total.to_s
  end

  def test_split_of_seventeen_thousand_and_five_hundred_cents_into_six_parts
    parts = Money.from_cents(17_500_00).split(6)

    assert_equal 6, parts.length
    assert_equal Money.from_cents(17_500_00), parts.sum(Money.from_cents(0))
    assert_operator parts.first, :>, parts.last
  end

  def test_split_of_one_hundred_cents_into_three_parts
    parts = Money.from_cents(100).split(3)

    assert_equal Money.from_cents(100), parts.sum(Money.from_cents(0))
  end

  def test_split_of_one_cent_into_one_part
    parts = Money.from_cents(1).split(1)

    assert_equal Money.from_cents(1), parts.sum(Money.from_cents(0))
  end

  def test_split_of_ten_cents_into_ten_parts
    parts = Money.from_cents(10).split(10)

    assert_equal Money.from_cents(10), parts.sum(Money.from_cents(0))
  end

  def test_adding_money_does_not_change_the_previous_value
    result = @a + @b

    assert_equal 30, result.cents
    assert_equal 10, @a.cents
    assert_equal 20, @b.cents
  end
end
