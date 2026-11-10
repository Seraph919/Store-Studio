-- Existing products and orders remain Cash on Delivery by default.
ALTER TABLE product ADD COLUMN payment_mode VARCHAR(12) NOT NULL DEFAULT 'COD';
ALTER TABLE product ADD COLUMN deposit_percent INTEGER;
ALTER TABLE product ADD CONSTRAINT chk_product_payment_mode CHECK (payment_mode IN ('COD','DEPOSIT','PREPAID'));
ALTER TABLE product ADD CONSTRAINT chk_product_deposit_percent CHECK (
   (payment_mode = 'DEPOSIT' AND deposit_percent BETWEEN 1 AND 99)
   OR (payment_mode <> 'DEPOSIT' AND deposit_percent IS NULL)
);

ALTER TABLE "order" ADD COLUMN upfront_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "order" ADD COLUMN delivery_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "order" ADD COLUMN upfront_payment_confirmed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "order" ADD COLUMN upfront_confirmed_at TIMESTAMP WITH TIME ZONE;
-- Previously created COD orders: the full order amount remains due on delivery.
UPDATE "order" SET delivery_amount = total_price;

ALTER TABLE order_items ADD COLUMN payment_mode_snapshot VARCHAR(12) NOT NULL DEFAULT 'COD';
ALTER TABLE order_items ADD COLUMN deposit_percent_snapshot INTEGER;
ALTER TABLE order_items ADD COLUMN upfront_amount NUMERIC(10,2) NOT NULL DEFAULT 0;
