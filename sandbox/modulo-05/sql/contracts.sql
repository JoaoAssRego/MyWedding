DROP TABLE IF EXISTS contracts;

CREATE TABLE contracts (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    vendor text NOT NULL,
    total_cents bigint CHECK (total_cents >= 0) NOT NULL,
    installment_count integer NOT NULL CHECK (installment_count >= 1),
    CONSTRAINT total_cents_cover_installment_count CHECK (total_cents >= installment_count),
    created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO contracts (vendor,total_cents,installment_count) VALUES ('Casarão do Paraíso',1750000,27);
INSERT INTO contracts (vendor,total_cents,installment_count) VALUES ('Gauss',390000,20);

SELECT * from contracts;

SELECT n AS number, 
            total_cents / installment_count 
            + CASE WHEN n <= total_cents % installment_count
            THEN 1 ELSE 0 END AS amount_cents
from contracts, generate_series(1, installment_count) AS n
WHERE id = 1 AND n IN (1,22,23,27)
ORDER BY number;


WITH contract AS (SELECT n AS number, 
            total_cents / installment_count 
            + CASE WHEN n <= total_cents % installment_count
            THEN 1 ELSE 0 END AS amount_cents
from contracts, generate_series(1, installment_count) AS n
WHERE id = 1)
SELECT SUM(amount_cents) from contract