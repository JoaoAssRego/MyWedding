# frozen_string_literal: true

# Immutable value object representing monetary amounts in cents.
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
    whole, decimal = cents.divmod(100)
    whole_with_thousands = whole.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\1.').reverse

    "R$ #{whole_with_thousands},#{decimal.to_s.rjust(2, '0')}"
  end

  private

  def validate_count!(count)
    raise ArgumentError, 'Count need to be Integer.' unless count.is_a?(Integer)
    raise ArgumentError, 'Count need to be greater than or equal to 1.' if count < 1
    raise ArgumentError, 'total cents need to be greater than count' if cents < count
  end
end
