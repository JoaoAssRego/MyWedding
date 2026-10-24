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
rescue StandardError
  puts "FAILED, #{e.class}"
end

def split_installments(total_cents, count)
  raise ArgumentError, "Count need to be Integer. Count: #{count}" unless count.is_a?(Integer)

  raise ArgumentError, "Count need to be greater than or equal to 1. Count: #{count}" if count < 1

  raise ArgumentError, 'total cents need to be positive' if total_cents.negative?

  raise ArgumentError, 'total cents need to be greater than count' if total_cents < count

  installments_value = total_cents / count

  rest_cents = total_cents % count

  Array.new(count) { |i| installments_value + (i < rest_cents ? 1 : 0) }
end

def installments(total_cents, count)
  split_installments(total_cents, count).map.with_index(1) do |value, number|
    {
      number: number,
      installment: value
    }
  end
end

# Tests
array_installments = split_installments(1_750_000, 27)

check('calibration: intentionally uses false so the test helper prints FAILED', false)

check('split_installments(1750000, 27) should return exactly 27 installments', array_installments.length == 27)

sum = 0
check('the 27 installments should add up to the original total of 1750000 cents', array_installments.each do |i|
  sum += i
end == 1_750_000)

check('the first installment should be 64815 cents and the last one should be 64814 cents',
      array_installments[0] == 64_815 && array_installments[-1] == 64_814)

check('split_installments(100, 3) should distribute the remaining cent as [34, 33, 33]',
      split_installments(100, 3) == [34, 33, 33])

check('split_installments(1, 1) should return one installment of 1 cent', split_installments(1, 1) == [1])
check('installments(1750000, 27).first should contain number 1, amount 64815', installments(1_750_000, 27).first == {
  number: 1,
  amount_cents: 64_815
})

check('installments(1750000, 27).last should be numbered 27', installments(1_750_000, 27).last[:number] == 27)

check_error('count equal to 0 should raise ArgumentError because it is below the minimum of 1') do
  split_installments(175_000, 0)
end
check_error('a non-integer count such as 2.5 should raise ArgumentError') { split_installments(175_000, 2.5) }
check_error('a negative total_cents value such as -1 should raise ArgumentError') { split_installments(-1, 20) }
check_error('total_cents lower than count should raise ArgumentError') do
  split_installments(5, 10)
end
