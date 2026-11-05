# frozen_string_literal: true

require 'json'
require_relative '../modulo-04/contract'
require_relative '../modulo-04/sample_contracts'

# Api for Contract
class ContractApi
  def call(env)
    path = env['PATH_INFO'].split('/')

    return not_found unless valid_path?(path)
    return method_not_allowed unless env['REQUEST_METHOD'] == 'GET'

    dispatch(path)
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

  def valid_path?(path)
    _, resource, id, *rest = path

    return false unless rest.empty?
    return false if resource == 'health' && id

    %w[contracts health].include?(resource)
  end

  def dispatch(path)
    _, resource, id = path

    case resource
    when 'health'
      health
    when 'contracts'
      id ? contract(id) : contracts
    end
  end

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
