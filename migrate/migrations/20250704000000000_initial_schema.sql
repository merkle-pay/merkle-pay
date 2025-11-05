-- Up Migration
-- Initial database schema for Merkle Pay
-- Creates tables for Payment, Boss, Business, Token, and PhantomDeepLink

-- ============================================================
-- SECTION 1: Create Enum Types
-- ============================================================

-- Payment Status Enum
CREATE TYPE "PaymentStatus" AS ENUM (
  'PENDING',
  'PROCESSED',
  'CONFIRMED',
  'FINALIZED',
  'EXPIRED',
  'FAILED',
  'REFUNDED',
  'CANCELLED'
);

-- ============================================================
-- SECTION 2: Create Tables
-- ============================================================

-- Boss Table (Admin/Merchant Users)
CREATE TABLE "Boss" (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    avatar_image_url TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    role TEXT DEFAULT 'boss' NOT NULL,
    backup_email TEXT,
    first_name TEXT,
    last_name TEXT
);

-- Business Table (Merchant Businesses)
CREATE TABLE "Business" (
    id SERIAL PRIMARY KEY,
    business_name TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    wallets TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    tokens TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Payment Table (Core Payment Records)
CREATE TABLE "Payment" (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    token TEXT NOT NULL,
    blockchain TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    status "PaymentStatus" NOT NULL,
    business_name TEXT DEFAULT '' NOT NULL,
    recipient_address TEXT NOT NULL,
    payer_address TEXT,
    "referencePublicKey" TEXT UNIQUE NOT NULL,
    mpid TEXT UNIQUE NOT NULL,
    raw JSONB NOT NULL,
    "txId" TEXT
);

-- Token Table (Auth Tokens - NOT blockchain tokens)
CREATE TABLE "Token" (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    boss_id INTEGER NOT NULL,
    boss_email TEXT NOT NULL,
    is_access_token BOOLEAN NOT NULL,
    is_refresh_token BOOLEAN NOT NULL,
    scope TEXT,
    is_valid BOOLEAN DEFAULT TRUE NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Token_boss_id_fkey" FOREIGN KEY (boss_id) REFERENCES "Boss"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- PhantomDeepLink Table (Phantom Wallet Integration)
CREATE TABLE "PhantomDeepLink" (
    id SERIAL PRIMARY KEY,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    mpid TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "requestId" TEXT,
    "paymentId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "txId" TEXT,
    phantom_encryption_public_key TEXT
);

-- ============================================================
-- SECTION 3: Create Indexes
-- ============================================================

-- Payment Indexes
CREATE INDEX "Payment_mpid_idx" ON "Payment"(mpid);
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");
CREATE INDEX "Payment_txId_idx" ON "Payment"("txId");
CREATE INDEX "Payment_status_idx" ON "Payment"(status);
CREATE INDEX "Payment_blockchain_idx" ON "Payment"(blockchain);
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- Boss Indexes
CREATE INDEX "Boss_email_idx" ON "Boss"(email);
CREATE INDEX "Boss_username_idx" ON "Boss"(username);

-- Token Indexes
CREATE INDEX "Token_boss_id_idx" ON "Token"(boss_id);
CREATE INDEX "Token_token_idx" ON "Token"(token);
CREATE INDEX "Token_is_valid_idx" ON "Token"(is_valid);
CREATE INDEX "Token_expiresAt_idx" ON "Token"("expiresAt");

-- Business Indexes
CREATE INDEX "Business_blockchain_idx" ON "Business"(blockchain);

-- PhantomDeepLink Indexes
CREATE INDEX "PhantomDeepLink_mpid_idx" ON "PhantomDeepLink"(mpid);
CREATE INDEX "PhantomDeepLink_requestId_idx" ON "PhantomDeepLink"("requestId");
CREATE INDEX "PhantomDeepLink_paymentId_idx" ON "PhantomDeepLink"("paymentId");

-- ============================================================
-- Down Migration
-- ============================================================

-- DROP TABLE "PhantomDeepLink";
-- DROP TABLE "Token";
-- DROP TABLE "Payment";
-- DROP TABLE "Business";
-- DROP TABLE "Boss";
-- DROP TYPE "PaymentStatus";
