-- One store-wide shipping policy, and one palette identifier per published storefront design.
ALTER TABLE store_settings ADD COLUMN shipping_mode VARCHAR(20) NOT NULL DEFAULT 'FREE';
ALTER TABLE store_settings ADD COLUMN shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE store_settings ADD COLUMN free_shipping_threshold NUMERIC(10,2);
ALTER TABLE store_settings ADD CONSTRAINT store_shipping_mode_valid CHECK (shipping_mode IN ('FREE','FLAT','FREE_ABOVE'));
ALTER TABLE store_settings ADD CONSTRAINT store_shipping_fee_valid CHECK (shipping_fee >= 0);
ALTER TABLE store_settings ADD CONSTRAINT store_shipping_threshold_valid CHECK (free_shipping_threshold IS NULL OR free_shipping_threshold > 0);
ALTER TABLE "order" ADD COLUMN shipping_fee NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE store_design ADD COLUMN palette_id VARCHAR(30) NOT NULL DEFAULT 'CHAMPAGNE';
-- Order tracking is not a product feature; remove the legacy lookup token after prior migrations.
ALTER TABLE "order" DROP COLUMN IF EXISTS tracking_token;
