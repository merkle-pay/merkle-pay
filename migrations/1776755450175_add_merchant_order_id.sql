-- Up Migration
-- Add a dedicated column for the merchant's external order reference.
-- Previously we were stuffing this into the `memo` text blob along with
-- payer/customer-message; the separate column makes it queryable and
-- flows naturally to the on-chain memo instruction.

ALTER TABLE orders ADD COLUMN merchant_order_id TEXT;

-- Not unique — different businesses can reuse the same invoice number,
-- and a merchant may legitimately re-use a ref across re-attempts.
CREATE INDEX idx_orders_business_merchant_order_id
  ON orders (business_id, merchant_order_id);

-- Down Migration

DROP INDEX IF EXISTS idx_orders_business_merchant_order_id;
ALTER TABLE orders DROP COLUMN IF EXISTS merchant_order_id;
