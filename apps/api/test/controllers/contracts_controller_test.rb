# frozen_string_literal: true

require "test_helper"

# HTTP behaviour of the Contract API.
class ContractsControllerTest < ActionDispatch::IntegrationTest
  test "requisition contracts returns contracts" do
    get "/contracts"
    contracts = response.parsed_body

    assert_response :ok
    assert_equal 2, contracts.size
    assert_equal expected_contracts(contracts(:photographer)), contracts[0]
    assert_equal expected_contracts(contracts(:salon)), contracts[1]
  end

  test "requisition contracts nonexistent method" do
    post "/contracts"

    assert_equal 405, response.status
  end

  test "requisition contracts specific" do
    photographer = contracts(:photographer)
    get "/contracts/#{photographer.id}"
    contracts = response.parsed_body

    assert_equal 200, response.status
    assert_equal photographer.id, contracts["id"]
    assert_equal "Gauss", contracts["vendor"]
    assert_equal 20, contracts["installment_count"]

    total_cents = contracts["installments"].sum do |installment|
      Integer(installment["amount_cents"])
    end
    assert_equal 390000, total_cents
  end

  test "requisition contracts nonexistent specific" do
    get "/contracts/99"

    assert_equal 404, response.status
  end

  test "requisition contracts nonexistent endpoint" do
    get "/contracts/1/x"

    assert_equal 404, response.status
  end

  test "access nonexistent contract" do
    get "/contracts/0#{contracts(:salon).id}"

    assert_equal 404, response.status
  end

  test "endpoint nonexistent" do
    get "/nonexistent"

    assert_equal 404, response.status
  end

  test "endpoint and method nonexistent" do
    post "/nonexistent"

    assert_equal 404, response.status
  end

  private

  def expected_contract_summary(contract)
    {
      "id" => contract.id,
      "vendor" => contract.vendor,
      "total_cents" => contract.total.cents,
      "installment_count" => contract.installment_count,
      "installments" => contract.installments.map do |installment|
        {
          "number" => installment.number,
          "amount_cents" => installment.amount.cents
        }
      end
    }
  end

  def expected_contracts(contract)
    {
      "id" => contract.id,
      "vendor" => contract.vendor,
      "total_cents" => contract.total.cents,
      "installment_count" => contract.installment_count
    }
  end
end
