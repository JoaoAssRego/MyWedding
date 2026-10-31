# frozen_string_literal: true

def check(description, condition)
  if condition
    puts "OK, #{description}"
  else
    puts "FAILED, #{description}"
  end
end

def check_error(description)
  yield
  puts "FAILED, #{description}"
rescue ArgumentError => e
  puts "OK, #{e.message}, with description of: #{description}"
rescue StandardError => e
  puts "FAILED, #{e.message}. #{description}"
end

def split_installments(total_cents, count)
  raise ArgumentError, 'Count need to be Integer.' unless count.is_a?(Integer)
  raise ArgumentError, "Count need to be greater than or equal to 1. #{count}" if count < 1
  raise ArgumentError, 'total cents must not be negative' if total_cents.negative?
  raise ArgumentError, 'total cents need to be greater than count' if total_cents < count

  installment_base, remainder = total_cents.divmod(count)

  Array.new(count) { |i| installment_base + (i < remainder ? 1 : 0) }
end

def installments(total_cents, count)
  split_installments(total_cents, count).map.with_index(1) do |value, number|
    {
      number: number,
      amount_cents: value
    }
  end
end

# Tests
array_installments = split_installments(17_500_00, 27)

check('calibration: intentionally uses false so the test helper prints FAILED', false)

check('split_installments(1750000, 27) should return exactly 27 installments', array_installments.length == 27)

check('the 27 installments should add up to the original total of 1750000 cents', array_installments.sum == 17_500_00)

check('the first installment should be 64815 cents and the last one should be 64814 cents',
      array_installments[0] == 648_15 && array_installments[-1] == 648_14)

check('The array should have exactly 22 installments of 64815', array_installments.count(648_15) == 22)

check('split_installments(100, 3) should distribute the remaining cent as [34, 33, 33]',
      split_installments(100, 3) == [34, 33, 33])

check('split_installments(1, 1) should return one installment of 1 cent', split_installments(1, 1) == [1])
check(
  'installments(1750000, 27).first should contain amount 64815',
  installments(17_500_00, 27).first == {
    number: 1,
    amount_cents: 648_15
  }
)

check('installments(1750000, 27).last should be numbered 27', installments(17_500_00, 27).last[:number] == 27)

check_error('count equal to 0 should raise ArgumentError because it is below the minimum of 1') do
  split_installments(17_500_00, 0)
end
check_error('a non-integer count such as 2.5 should raise ArgumentError') { split_installments(17_500_00, 2.5) }
check_error('a negative total_cents value such as -1 should raise ArgumentError') { split_installments(-1, 20) }
check_error('total_cents lower than count should raise ArgumentError') do
  split_installments(5, 10)
end
