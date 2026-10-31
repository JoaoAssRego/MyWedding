# frozen_string_literal: true

require 'minitest/autorun'
require_relative '../money'
# Class to test Money
class MoneySplitTest < Minitest::Test
  def setup
    @total = Money.from_cents(17_500_00)
    @parts = @total.split(27)
  end

  def test_split_returns_the_requested_number_of_money_values
    assert_equal 27, @parts.length
    assert @parts.all?(Money)
  end

  def test_split_values_sum_to_the_original_total
    assert_equal @total, @parts.sum(Money.from_cents(0))
  end

  def test_split_puts_the_extra_cent_in_the_first_installments
    assert_equal 648_15, @parts.first.cents
    assert_equal 648_14, @parts.last.cents
  end

  def test_split_rejects_a_count_below_one
    error = assert_raises(ArgumentError) do
      @total.split(0)
    end

    assert_equal 'Count must be greater than or equal to 1.', error.message
  end

  def test_split_rejects_a_non_integer_count
    error = assert_raises(ArgumentError) do
      @total.split(2.5)
    end
    assert_equal 'Count must be Integer.', error.message
  end

  def test_split_rejects_more_parts_than_cents
    error = assert_raises(ArgumentError) do
      @total.split(17_500_01)
    end

    assert_equal 'total cents need to be greater than count', error.message
  end

  def test_split_of_seventeen_thousand_and_five_hundred_cents_into_six_parts
    parts = Money.from_cents(17_500_00).split(6)

    assert_equal 6, parts.length
    assert_equal Money.from_cents(17_500_00), parts.sum(Money.from_cents(0))
    assert_operator parts.first, :>, parts.last
  end

  def test_split_of_one_hundred_cents_into_three_parts
    parts = Money.from_cents(100).split(3)

    assert_equal [34, 33, 33], parts.map(&:cents)
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
end
