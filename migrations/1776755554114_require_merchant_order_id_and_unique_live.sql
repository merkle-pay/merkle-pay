-- Up Migration
-- merchant_order_id is required — it's the pairing key between our mpid and
-- the merchant's external reference and goes directly into the on-chain memo.
--
-- Also enforces one "live" order per (business_id, merchant_order_id).
-- Live = still on the happy path or already settled as paid. After an order
-- fails/expires/cancels/refunds, a new attempt with the same ref is allowed.

ALTER TABLE orders ALTER COLUMN merchant_order_id SET NOT NULL;

CREATE UNIQUE INDEX idx_orders_business_merchant_live
  ON orders (business_id, merchant_order_id)
  WHERE status NOT IN ('EXPIRED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- Down Migration

DROP INDEX IF EXISTS idx_orders_business_merchant_live;
ALTER TABLE orders ALTER COLUMN merchant_order_id DROP NOT NULL;
