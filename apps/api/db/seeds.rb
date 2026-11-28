# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

Contract.find_or_create_by!(vendor: "Casarão do Paraíso") do |contract|
  contract.total_cents = 1750000
  contract.installment_count = 27
end

Contract.find_or_create_by!(vendor: "Gauss") do |contract|
  contract.total_cents = 390000
  contract.installment_count = 20
end
