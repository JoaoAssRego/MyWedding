require "test_helper"

class ContractTest < ActiveSupport::TestCase
  # test "the truth" do
  #   assert true
  # end

  setup do
    @contract_photographer = contracts(:photographer)
  end

  test "total is money" do
    assert_instance_of Money, @contract_photographer.total
  end

  test "sum of installment is equal to total" do
    sum = @contract_photographer.installments.sum(Money.from_cents(0), &:amount)

    assert_equal @contract_photographer.total, sum
  end

  test "rejects 5 cents split into 10 installments" do
    error = assert_raises(ActiveRecord::CheckViolation) do
      Contract.create!(
        vendor: "Gauss",
        total_cents: 5,
        installment_count: 10
      )
    end
  end
end
