# frozen_string_literal: true

require 'minitest/autorun'
require 'rack/mock'
require 'rack/lint'
require 'json'
require_relative '../contracts_api'
require_relative '../../modulo-04/sample_contracts'
# HTTP behaviour of the Contract API.
class ContractApiTest < Minitest::Test
  def setup
    app = Rack::Lint.new(ContractApi.new)
    @request = Rack::MockRequest.new(app)
  end

  def test_requisition_health
    response = @request.get('/health')

    assert_equal 200, response.status
    assert_equal({ 'status' => 'OK' }, JSON.parse(response.body))
  end

  def test_requisition_health_origem
    response = @request.get('/health?origem=monitor')

    assert_equal 200, response.status
    assert_equal({ 'status' => 'OK' }, JSON.parse(response.body))
  end

  def test_requisition_contracts
    response = @request.get('/contracts')
    contracts = JSON.parse(response.body, symbolize_names: true)

    assert_equal 200, response.status
    assert_equal 2, contracts.size
    assert_equal expected_contract_summary(SAMPLE_CONTRACTS[0]), contracts[0]
    assert_equal expected_contract_summary(SAMPLE_CONTRACTS[1]), contracts[1]
  end

  def test_requisition_contracts_specific
    response = @request.get('/contracts/2')
    contracts = JSON.parse(response.body, symbolize_names: true)
    contracts_gauss = SAMPLE_CONTRACTS[1]

    assert_equal 200, response.status
    assert_equal expected_contract_summary(SAMPLE_CONTRACTS[1]), contracts
    assert_equal(contracts_gauss.total, Money.from_cents(contracts[:installments].sum do |installment|
      Integer(installment[:amount_cents])
    end))
  end

  def test_access_nonexistent_contract
    response = @request.get('/contracts/01')

    assert_equal 404, response.status
  end

  def test_method_nonexistent_health
    response = @request.post('/health')

    assert_equal 405, response.status
    assert_equal 'GET', response['allow']
    assert_equal 'application/json', response['content-type']
  end

  def test_endpoint_nonexistent_health
    response = @request.get('/health/anything')

    assert_equal 404, response.status
  end

  def test_endpoint_nonexistent
    response = @request.get('/nonexistent')

    assert_equal 404, response.status
  end

  private

  def expected_contract_summary(contract)
    {
      id: contract.id,
      vendor: contract.vendor,
      total_cents: contract.total.cents,
      installment_count: contract.installment_count,
      installments: contract.installments.map do |installment|
        {
          number: installment.number,
          amount_cents: installment.amount.cents
        }
      end
    }
  end
end
