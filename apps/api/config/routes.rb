Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
  get "health" => "health#health", as: :contract_health_check
  get "contracts" => "contracts#contracts", as: :contract_list
  get "contracts/:id" => "contracts#contract", as: :contract_specific

  match "health", via: :all, to: "health#method_not_allowed"
  match "contracts", via: :all, to: "contracts#method_not_allowed"
  match "contracts/:id", via: :all, to: "contracts#method_not_allowed"
  # Defines the root path route ("/")
  # root "posts#index"
end
