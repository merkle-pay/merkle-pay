-- Seed: the single boss for this deployment.
--
-- Email:    boss@merklepay.local
-- Password: merklepay-dev-2026   (CHANGE THIS BEFORE ANY REAL DEPLOY)
-- Hash:     PBKDF2-SHA256, 100k iterations, 16-byte salt, 32-byte hash (salt:hash hex)
--
-- To rotate the password:
--   tsx scripts/hash-password.ts 'new-password-here'
-- then replace the password_hash value below.
--
-- The singleton unique index on bosses guarantees at most one row;
-- the unique index on LOWER(email) makes re-seeding a no-op.

INSERT INTO bosses (email, password_hash, name)
VALUES (
  'boss@merklepay.local',
  'f9d6ca155ac03c1451c90812fb8fb66e:420e84ff733e40cd240158bccf9dcca026d89cabca6d2e7e5e92f18bdfbcabe6',
  'Boss'
)
ON CONFLICT ((LOWER(email))) DO NOTHING;
