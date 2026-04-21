-- Seed: a demo business so phase 3 has something to point pay links at.
--
-- IMPORTANT: the `solana.payout` address below is a placeholder (the Solana
-- system program address, all-zero pubkey). Replace it with YOUR OWN Solana
-- wallet before doing any real-money test — otherwise the QR will encode a
-- payment to an unspendable address.
--
-- To update after seeding:
--   UPDATE businesses
--   SET chain_config = jsonb_set(chain_config, '{solana,payout}', '"<YOUR_WALLET>"')
--   WHERE slug = 'demo';

INSERT INTO businesses (name, slug, chain_config)
VALUES (
  'Demo Business',
  'demo',
  '{
    "solana": {
      "payout": "11111111111111111111111111111111",
      "tokens": ["USDC", "USDT", "SOL"]
    }
  }'::jsonb
)
ON CONFLICT ((LOWER(slug))) DO NOTHING;
