class ContractsController < ApplicationController
    def contracts
      contracts = SampleContracts::ALL.map do |contract|
        {
          id: contract.id,
          vendor: contract.vendor,
          total_cents: contract.total.cents,
          installment_count: contract.installment_count
        }
      end
      render json: contracts
    end

    def contract
        contract = SampleContracts::ALL.find do |contract|
            contract.id == params[:id]
        end

        return render json: { error: "Contract not found" }, status: :not_found unless contract

        render json: {
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

    def method_not_allowed
      response.set_header("Allow", "GET")
      render json: { error: "Method not allowed" }, status: :method_not_allowed
    end
end
