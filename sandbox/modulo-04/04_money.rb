# frozen_string_literal: true

# Creation of money on class
class Money
  include Comparable

  attr_reader :cents

  def initialize(cents)
    raise ArgumentError, 'Cents must be a non-negative Integer' unless cents.is_a?(Integer) && !cents.negative?

    @cents = cents
    freeze
  end

  def self.from_cents(cents)
    new(cents)
  end

  private_class_method :new

  def +(other)
    Money.from_cents(cents + other.cents)
  end

  def -(other)
    raise ArgumentError, "Result Money can't be negative" if other.cents > cents

    Money.from_cents(cents - other.cents)
  end

  def <=>(other)
    cents <=> other.cents if other.is_a?(Money)
  end

  def eql?(other)
    other.is_a?(Money) && cents == other.cents
  end

  def hash
    [Money, cents].hash
  end

  def split(count)
    validate_count!(count)

    installment_base, remainder = cents.divmod(count)

    Array.new(count) do |i|
      Money.from_cents(installment_base + (i < remainder ? 1 : 0))
    end
  end

  def to_s
    inteiro, decimal = cents.abs.divmod(100)
    inteiro_com_milhar = inteiro.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\1.').reverse
    sinal = cents.negative? ? '-' : ''

    "#{sinal}R$ #{inteiro_com_milhar},#{decimal.to_s.rjust(2, '0')}"
  end

  private

  def validate_count!(count)
    raise ArgumentError, "Count need to be Integer. Count: #{count}" unless count.is_a?(Integer)
    raise ArgumentError, "Count need to be greater than or equal to 1. Count: #{count}" if count < 1
    raise ArgumentError, 'total cents need to be greater than count' if cents < count
  end
end

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

check('calibration: intentionally uses false so the test helper prints FAILED', false)

total = Money.from_cents(1_750_000)

a = Money.from_cents(10)
b = Money.from_cents(20)
c = Money.from_cents(30)

check('Money.from_cents(1_750_000).cents should equal 1_750_000',
      total.cents == 1_750_000)
check('Money.new should be private',
      Money.respond_to?(:new) == false)
check_error('Money.from_cents(-1) should raise ArgumentError for negative cents') do
  Money.from_cents(-1)
end
check_error('Money.from_cents(10.5) should raise ArgumentError for non-integer cents') do
  Money.from_cents(10.5)
end
check('a + b should return 30 cents without changing a',
      (a + b).cents == 30 && a.cents == 10)
check('b - a should return 10 cents',
      (b - a).cents == 10)
check_error('a - b should raise ArgumentError instead of producing negative money') do
  a - b
end
check('Money values should support greater-than and less-than comparisons',
      b > a && a < b)
equal_value_a = Money.from_cents(10)
equal_value_b = Money.from_cents(10)
check('equal Money values should be == but not the same object',
      equal_value_a == equal_value_b && !equal_value_a.equal?(equal_value_b))
check('Money should not be == to an Integer',
      (Money.from_cents(10) == 10) == false)
check('Hash equality should make duplicate Money values unique as one item',
      [Money.from_cents(10), Money.from_cents(10)].uniq.size == 1)
check('Money values should sort and find their maximum through Comparable',
      [c, a, b].sort == [a, b, c] && [c, a, b].max == c)
check('Money instances should be frozen',
      total.frozen?)

parts = total.split(27)
check('total.split(27) should return 27 Money instances',
      parts.length == 27 && parts.all?(Money))
check('the 27 split Money values should sum to the original total',
      parts.sum(Money.from_cents(0)) == total)
check('the first split should be 64815 cents and the last should be 64814 cents',
      parts.first.cents == 64_815 && parts.last.cents == 64_814)
check_error('split(0) should raise ArgumentError for a count below 1') do
  total.split(0)
end
check_error('split(2.5) should raise ArgumentError for a non-integer count') do
  total.split(2.5)
end
check_error('splitting 5 cents into 10 parts should raise ArgumentError') do
  Money.from_cents(5).split(10)
end
check('to_s should format cents as Brazilian currency with thousands separators',
      Money.from_cents(1_750_000).to_s == 'R$ 17.500,00' &&
        Money.from_cents(291_667).to_s == 'R$ 2.916,67' &&
        Money.from_cents(5).to_s == 'R$ 0,05')
