# Database Architecture

This document describes the Merkle Pay database schema, models, and design patterns.

## Database Schema

**Technology:** PostgreSQL with direct SQL queries via `node-postgres`

**Schema Definition:** SQL migration files in `apps/merkle-pay/src/database/migrations/`

## Core Models

### Payment Model

Tracks every payment transaction across blockchains.

```sql
-- Payment Status Enum
CREATE TYPE "PaymentStatus" AS ENUM (
  'PENDING',    -- Initial state, awaiting blockchain confirmation
  'PROCESSED',  -- Payment processed but not yet confirmed
  'CONFIRMED',  -- Transaction found on chain
  'FINALIZED',  -- Transaction finalized (Solana confirmed/finalized)
  'EXPIRED',    -- Payment link expired (2 hour timeout)
  'FAILED',     -- Transaction failed on chain
  'REFUNDED',   -- Payment was refunded
  'CANCELLED'   -- Payment was cancelled by user
);

-- Payment Table
CREATE TABLE "Payment" (
  id                  SERIAL PRIMARY KEY,
  "createdAt"         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Amount and token
  amount              DOUBLE PRECISION NOT NULL,  -- Numeric amount (e.g., 100.50)
  token               VARCHAR(50) NOT NULL,       -- Token name (USDC, USDT, SOL)
  blockchain          VARCHAR(50) NOT NULL,       -- Chain (solana, base, polygon)

  -- Merchant reference
  "orderId"           VARCHAR(255) NOT NULL,      -- Merchant's order ID
  business_name       VARCHAR(255) NOT NULL,      -- Business display name

  -- Wallet addresses
  recipient_address   VARCHAR(255) NOT NULL,      -- Where payment goes
  payer_address       VARCHAR(255),               -- Who paid (if known)

  -- Tracking
  mpid                VARCHAR(50) UNIQUE NOT NULL,    -- Merkle Pay ID (nanoid)
  "referencePublicKey" VARCHAR(255) UNIQUE NOT NULL,  -- For Solana Pay reference
  "txId"              VARCHAR(255),                    -- Blockchain transaction hash

  -- Storage
  status              "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  raw                 JSONB NOT NULL              -- Raw payment form data
);
```

**Key Fields Explained:**

- **mpid:** Unique identifier for payment tracking (nanoid)
- **referencePublicKey:** Used in Solana Pay to identify payment via blockchain query
- **txId:** Populated after transaction is found/submitted
- **raw:** Complete payment form data as JSON backup
- **status:** State machine for payment lifecycle

### Payment Status State Machine

```
PENDING → PROCESSED → CONFIRMED → FINALIZED
   ↓                       ↓
EXPIRED              FAILED
   ↓                   ↓
CANCELLED         REFUNDED
```

- **PENDING:** Payment initialized, awaiting on-chain confirmation
- **PROCESSED:** Transaction submitted to blockchain
- **CONFIRMED:** Transaction found at "confirmed" commitment level
- **FINALIZED:** Transaction reached "finalized" level (Solana)
- **EXPIRED:** Payment link exceeded 2-hour window
- **FAILED:** Transaction failed on-chain (tx.meta.err exists)
- **CANCELLED:** User cancelled or merchant revoked
- **REFUNDED:** Payment was refunded to payer

### PhantomDeepLink Model

Manages Phantom wallet deeplink sessions for mobile payments.

```sql
CREATE TABLE "PhantomDeepLink" (
  id                            SERIAL PRIMARY KEY,
  "publicKey"                   VARCHAR(255) NOT NULL,  -- Payer's public key
  "privateKey"                  VARCHAR(255) NOT NULL,  -- Temporary private key for encryption

  mpid                          VARCHAR(50) NOT NULL,   -- Reference to Payment
  "orderId"                     VARCHAR(255) NOT NULL,
  "requestId"                   VARCHAR(255),
  "paymentId"                   INTEGER NOT NULL,       -- Foreign key to Payment

  "expiresAt"                   TIMESTAMP NOT NULL,     -- Session expiration
  "txId"                        VARCHAR(255),

  phantom_encryption_public_key VARCHAR(255),
  "createdAt"                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"                   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Boss Model

Merchant/admin accounts.

```sql
CREATE TABLE "Boss" (
  id                  SERIAL PRIMARY KEY,
  username            VARCHAR(100) UNIQUE NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       VARCHAR(255) NOT NULL,  -- bcryptjs hash

  is_email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_image_url    TEXT,
  backup_email        VARCHAR(255),
  first_name          VARCHAR(100),
  last_name           VARCHAR(100),

  role                VARCHAR(50) NOT NULL DEFAULT 'boss',  -- Role-based access

  "createdAt"         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Business Model

Merchant business entities.

```sql
CREATE TABLE "Business" (
  id            SERIAL PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL,
  blockchain    VARCHAR(50) NOT NULL,   -- Primary blockchain

  wallets       TEXT[] DEFAULT '{}',    -- Array of recipient wallets
  tokens        TEXT[] DEFAULT '{}',    -- Supported tokens

  "createdAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Token Model

JWT token storage for session management.

```sql
CREATE TABLE "Token" (
  id               SERIAL PRIMARY KEY,
  token            TEXT NOT NULL,           -- JWT token value
  boss_id          INTEGER NOT NULL,
  boss_email       VARCHAR(255) NOT NULL,

  is_access_token  BOOLEAN NOT NULL,        -- True for short-lived access tokens
  is_refresh_token BOOLEAN NOT NULL,        -- True for long-lived refresh tokens

  scope            VARCHAR(100),
  is_valid         BOOLEAN NOT NULL DEFAULT TRUE,
  "expiresAt"      TIMESTAMP,

  "createdAt"      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (boss_id) REFERENCES "Boss"(id)
);
```

**Token Schema Explained:**

- **is_access_token:** Short-lived (for API auth)
- **is_refresh_token:** Long-lived (for token rotation)
- **is_valid:** Can be revoked server-side
- **expiresAt:** Token expiration timestamp

## Design Patterns

### ACID Compliance

PostgreSQL transactions for payment state changes ensure atomicity and consistency.

### Referential Integrity

Foreign keys ensure data consistency across related models.

### Indexing

Unique constraints on `mpid` and `referencePublicKey` for fast lookups.

### Audit Trail

`createdAt`/`updatedAt` timestamps on all models for comprehensive tracking.

## Database Management

### SQL Migrations

- Custom migration system in `apps/merkle-pay/src/database/migrations/`
- Direct SQL migration files for schema changes
- PostgreSQL connection pooling via Neon (or local instance)

### Database Operations

Database operations use direct SQL queries via `node-postgres`:

- **Query interface:** `apps/merkle-pay/src/lib/db.ts`
- **Compatibility layer:** `apps/merkle-pay/src/lib/db-compat.ts` (provides familiar API)
- **Service functions:** `apps/merkle-pay/src/services/payment.ts`

**Example Query:**
```typescript
import { query, queryOne } from '@/lib/db';

// Fetch single record
const payment = await queryOne(
  'SELECT * FROM "Payment" WHERE mpid = $1',
  [mpid]
);

// Fetch multiple records
const payments = await query(
  'SELECT * FROM "Payment" ORDER BY "createdAt" DESC LIMIT $1 OFFSET $2',
  [pageSize, skip]
);
```

## Environment Configuration

```
DATABASE_URL=postgresql://user:password@host:port/database
```
