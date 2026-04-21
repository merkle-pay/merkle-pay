-- Up Migration
-- Initial schema for Merkle Pay (greenfield rebuild).
--
-- Policies enforced in-schema:
--   * NO foreign keys. Every *_id column is plain, indexed, and integrity is
--     enforced in application code.
--   * Exactly ONE boss per deployment (partial unique index on `bosses`).
--   * Staff-to-business access lives inline on `staff.business_ids UUID[]`
--     with a GIN index — no join table.
--
-- Naming:
--   * Tables are plural.
--   * Timestamps are TIMESTAMPTZ with NOW() defaults.

-- ---------------------------------------------------------------------------
-- bosses: the single owner account
-- ---------------------------------------------------------------------------
CREATE TABLE bosses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_bosses_email ON bosses (LOWER(email));
-- Enforce "exactly one boss row" at the schema level.
CREATE UNIQUE INDEX idx_bosses_singleton ON bosses ((1));

-- ---------------------------------------------------------------------------
-- staff: 0..N operational accounts, scoped to specific businesses
-- ---------------------------------------------------------------------------
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  business_ids UUID[] NOT NULL DEFAULT '{}',
  disabled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_staff_email ON staff (LOWER(email));
CREATE INDEX idx_staff_business_ids ON staff USING GIN (business_ids);

-- ---------------------------------------------------------------------------
-- businesses: merchant entities (implicitly owned by the one boss)
-- ---------------------------------------------------------------------------
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  -- JSONB payload: supported chains + per-chain payout wallets & tokens.
  -- Shape example:
  --   { "solana": { "payout": "...", "tokens": ["USDC","USDT","SOL"] } }
  chain_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_businesses_slug ON businesses (LOWER(slug));

-- ---------------------------------------------------------------------------
-- customers: payer identities, deduped per business
-- ---------------------------------------------------------------------------
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  wallet_address TEXT,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT customers_has_identity
    CHECK (wallet_address IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX idx_customers_business_id ON customers (business_id);
CREATE UNIQUE INDEX idx_customers_business_wallet
  ON customers (business_id, wallet_address)
  WHERE wallet_address IS NOT NULL;
CREATE UNIQUE INDEX idx_customers_business_email
  ON customers (business_id, LOWER(email))
  WHERE email IS NOT NULL;

-- ---------------------------------------------------------------------------
-- orders: payment requests
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL,
  customer_id UUID,
  created_by_staff_id UUID,              -- NULL = boss or public API
  mpid TEXT NOT NULL,                    -- short public id (nanoid)
  reference_public_key TEXT NOT NULL,    -- Solana reference key (base58)
  chain TEXT NOT NULL CHECK (chain IN ('solana')),
  token TEXT NOT NULL,                   -- e.g. 'USDC', 'USDT', 'SOL'
  amount NUMERIC(38, 18) NOT NULL CHECK (amount > 0),
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN (
      'PENDING','PROCESSED','CONFIRMED','FINALIZED',
      'EXPIRED','FAILED','CANCELLED','REFUNDED'
    )),
  tx_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_orders_mpid ON orders (mpid);
CREATE UNIQUE INDEX idx_orders_reference_key ON orders (reference_public_key);
CREATE INDEX idx_orders_business_id ON orders (business_id);
CREATE INDEX idx_orders_customer_id ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_business_status_created
  ON orders (business_id, status, created_at DESC);

-- ---------------------------------------------------------------------------
-- tokens: session records for boss + staff
-- ---------------------------------------------------------------------------
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('boss', 'staff')),
  actor_id UUID NOT NULL,
  token_hash TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_tokens_hash ON tokens (token_hash);
CREATE INDEX idx_tokens_actor ON tokens (actor_type, actor_id);
CREATE INDEX idx_tokens_expires ON tokens (expires_at);

-- ---------------------------------------------------------------------------
-- phantom_deeplinks: Phantom mobile deeplink session per order
-- ---------------------------------------------------------------------------
CREATE TABLE phantom_deeplinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL,
  dapp_public_key TEXT NOT NULL,
  dapp_secret_key TEXT NOT NULL,
  phantom_public_key TEXT,
  session TEXT,
  shared_secret TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phantom_deeplinks_order_id ON phantom_deeplinks (order_id);

-- Down Migration

DROP TABLE IF EXISTS phantom_deeplinks;
DROP TABLE IF EXISTS tokens;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS bosses;
