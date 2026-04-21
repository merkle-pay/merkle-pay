-- Seed: a demo business so phase 3 has something to point pay links at.
--
-- The `solana.payout` below is the owner's mainnet wallet. Change it to your
-- own before a real-money test, or override per-deploy with:
--   UPDATE businesses
--   SET chain_config = jsonb_set(chain_config, '{solana,payout}', '"<YOUR_WALLET>"')
--   WHERE slug = 'demo';

INSERT INTO businesses (name, slug, chain_config)
VALUES (
  'Demo Business',
  'demo',
  '{
    "solana": {
      "payout": "9CYjW8pbjB6FgAnyfX4cftmmLnr3ChRoT9KJwLSL3rJP",
      "tokens": ["USDC", "USDT", "SOL"]
    }
  }'::jsonb
)
ON CONFLICT ((LOWER(slug))) DO NOTHING;
