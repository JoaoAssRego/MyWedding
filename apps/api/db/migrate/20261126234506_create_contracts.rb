class CreateContracts < ActiveRecord::Migration[8.1]
  def change
    create_table :contracts do |t|
      t.text :vendor, null: false
      t.bigint :total_cents, null: false
      t.integer :installment_count, null: false

      t.timestamps

      t.check_constraint "total_cents >= 0", name: "contract_total_cents_check"
      t.check_constraint "installment_count >=1", name: "contract_installment_count_check"
      t.check_constraint "total_cents >= installment_count", name: "total_cents_covers_installment_count"
    end
  end
end
