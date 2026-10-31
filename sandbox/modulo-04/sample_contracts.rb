# frozen_string_literal: true

require_relative 'contract'
require_relative 'money'

contract_salon = Contract.new(
  id: '1',
  vendor: 'Casarão do Paraíso',
  total: Money.from_cents(17_500_00),
  installment_count: 27
)

contract_fotograph = Contract.new(
  id: '2',
  vendor: 'Gauss',
  total: Money.from_cents(3_900),
  installment_count: 20
)

SAMPLE_CONTRACTS = [contract_salon, contract_fotograph].freeze
