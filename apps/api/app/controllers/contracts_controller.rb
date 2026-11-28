class ContractsController < ApplicationController
    def contracts
      contracts = Contract.order(:id).map do |contract|
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
        return render json: { error: "Contract not found" }, status: :not_found unless params[:id].match?(/\A[1-9]\d*\z/)

        contract = Contract.find_by(id: params[:id])

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
