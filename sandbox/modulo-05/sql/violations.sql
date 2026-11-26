INSERT INTO contracts (vendor,total_cents,installment_count) VALUES ('Negative', -1, 10);
--ERROR:  new row for relation "contracts" violates check constraint "contracts_total_cents_check"

INSERT INTO contracts (vendor,total_cents,installment_count) VALUES ('installment_count zero', 10, 0);
--ERROR:  new row for relation "contracts" violates check constraint "contracts_installment_count_check"

INSERT INTO contracts (vendor,total_cents,installment_count) VALUES ('Too cheap', 5, 10);
--ERROR:  new row for relation "contracts" violates check constraint "total_cents_cover_installment_count"

INSERT INTO contracts (vendor,total_cents,installment_count) VALUES (NULL, 100, 10);
--ERROR:  null value in column "vendor" of relation "contracts" violates not-null constraint

INSERT INTO contracts (id,vendor,total_cents,installment_count) VALUES (2,'Gauss',99,10);
--ERROR:  cannot insert a non-DEFAULT value into column "id"

INSERT INTO contracts (vendor,total_cents,installment_count) VALUES ('total_cents float', 1750000.4, 10);
--Total cents goes integer to database

SELECT count(*) from contracts;