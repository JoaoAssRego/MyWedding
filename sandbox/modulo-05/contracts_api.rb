# frozen_string_literal: true

require 'json'
require_relative '../modulo-04/contract'
require_relative '../modulo-04/sample_contracts'

# Api for Contract
class ContractApi
  def call(env)
    _, resource, id, *rest = env['PATH_INFO'].split('/')

    return not_found unless %w[contracts health].include?(resource) && rest.empty?
    return method_not_allowed unless env['REQUEST_METHOD'] == 'GET'

    if resource == 'health'
      health
    elsif resource == 'contracts'
      id ? contract(id) : contracts
    end
  end

  def health
    json(200, { status: 'OK' })
  end

  def contracts
    json(
      200,
      SAMPLE_CONTRACTS.map do |contract|
        contract_data(contract)
      end
    )
  end

  def contract(id)
    contract = SAMPLE_CONTRACTS.find { |item| item.id == id }

    return not_found unless contract

    json(
      200,
      contract_data(contract)
    )
  end

  def not_found
    json(404, { error: 'Not found' })
  end

  def method_not_allowed
    json(405, { error: 'Method not allowed' }, 'allow' => 'GET')
  end

  private

  def contract_data(contract)
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

  def json(status, body, extra_headers = {})
    [status, { 'content-type' => 'application/json' }.merge(extra_headers), [JSON.generate(body)]]
  end
end
