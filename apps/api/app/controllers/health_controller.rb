class HealthController < ApplicationController
    def health
      render json: { status: "ok" }
    end

    def method_not_allowed
      response.set_header("Allow", "GET")
      render json: { error: "Method not allowed" }, status: :method_not_allowed
    end
end
