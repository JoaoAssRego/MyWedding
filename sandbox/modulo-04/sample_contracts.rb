# frozen_string_literal: true

require_relative 'contract'
require_relative 'money'

contract_salon = Contract.new(
  id: '1',
  vendor: 'Casarão do Paraíso',
  total: Money.from_cents(17_500_00),
  installment_count: 27
)

photographer_contract = Contract.new(
  id: '2',
  vendor: 'Gauss',
  total: Money.from_cents(390_000),
  installment_count: 20
)

SAMPLE_CONTRACTS = [contract_salon, photographer_contract].freeze
