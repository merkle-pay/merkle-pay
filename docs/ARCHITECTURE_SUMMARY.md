# Merkle Pay Architecture Quick Reference

A brief summary of the key architectural concepts. See CLAUDE.md for comprehensive details.

## Monorepo Structure

```
merkle-pay/
├── apps/merkle-pay          Next.js (Port 8888): Payment form + API backend
├── apps/merkle-dashboard    Vite/React (Port 9999): Admin dashboard
├── apps/merkle-server       Fastify (Port 9000): Microservice for blockchain ops
└── caddy/                   Reverse proxy + SSL termination
```

## Three Main Applications

### 1. Merkle Pay (Next.js)
- **Purpose:** Customer-facing payment form and primary API backend
- **Key Routes:**
  - `POST /api/payment/init-solana` - Initialize payment
  - `GET /api/payment/status?mpid=<id>` - Check payment status
  - `POST /api/boss-auth/sign-in` - Merchant authentication
- **Tech:** Next.js 15, Solana Web3.js, Prisma, Zod, Zustand
- **Database:** PostgreSQL via Prisma ORM

### 2. Merkle Dashboard (Vite/React)
- **Purpose:** Admin dashboard for merchants to view payments
- **Key Features:** Payment history, business management, settings
- **Tech:** Vite, React 19, TanStack Router, TanStack Query, Zustand
- **State:** Auth via Zustand, server state via React Query
- **Port:** 9999 (dev), served at `/dashboard` in production

### 3. Merkle Server (Fastify)
- **Purpose:** Microservice for blockchain-specific operations
- **Key Route:** `GET /public/solana/tx-status?mpid=<id>`
- **Tech:** Fastify 5, TypeBox, Native PostgreSQL driver
- **Port:** 9000

## Database Models

### Payment (Core)
Tracks every transaction with status state machine:
- **mpid:** Unique Merkle Pay ID (nanoid)
- **referencePublicKey:** For Solana Pay blockchain queries
- **txId:** Blockchain transaction hash
- **status:** PENDING → CONFIRMED → FINALIZED (or FAILED/EXPIRED)

### Boss (Users)
Merchant accounts with JWT tokens for authentication

### Business
Merchant business entities with wallet addresses

### PhantomDeepLink
Session management for Phantom mobile wallet integration

## Payment Flow (Simplified)

```
1. Merchant initializes payment
   → POST /api/payment/init-solana
   → Backend creates Payment record (PENDING)
   → Returns Solana Pay QR code URL

2. Customer scans QR or uses wallet extension
   → Signs transaction with Phantom/Solflare
   → Submits to Solana blockchain

3. Backend monitors transaction
   → GET /api/payment/status (polls periodically)
   → Queries Solana chain by referencePublicKey
   → Finds txId and updates Payment record

4. Payment completes
   → Status: CONFIRMED
   → Redirect to returnUrl
   → Merchant verifies via API
```

## Key Architectural Patterns

### API Response Format (Consistent across all endpoints)
```typescript
{
  code: number,      // 200, 400, 401, 404, 500
  data: T | null,    // Payload or null on error
  message: string    // Human-readable message
}
```

### Validation Layers
1. **Zod schemas** - Runtime validation at API boundaries
2. **TypeScript types** - Compile-time type checking
3. **Prisma models** - Database schema enforcement

### Authentication
- JWT-based with refresh token pattern
- Access tokens: 24 hours (httpOnly)
- Refresh tokens: 60 days (httpOnly)
- Cookie-based storage in browser

### Error Handling
- Global error handler in dashboard (main.tsx)
- 401 errors trigger sign-out and redirect
- 500 errors show error page
- Blockchain errors captured via tx.meta.err

## Blockchain Integration

### Solana Implementation
- **Standard:** Solana Pay (QR code protocol)
- **Tokens:** SOL, USDC, USDT with proper decimal conversion
- **Reference Mechanism:** Ephemeral keypair for payment disambiguation
- **Confirmation:** "confirmed" commitment level
- **Timing:** 2-hour payment link validity

### EVM Implementation (In Progress)
- **Standard:** EIP-681 (Ethereum payment request)
- **Format:** ethereum:<recipient>?value=<wei>
- **Wallets:** MetaMask, Rabby, Phantom (future)

## Environment Configuration

**Key Variables:**
```
DATABASE_URL                        # PostgreSQL connection
JWT_SECRET                         # Token signing key
NEXT_PUBLIC_BLOCKCHAIN_OPTIONS     # solana,base (comma-separated)
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT    # Blockchain RPC
NEXT_PUBLIC_TURNSTILE_SITE_KEY     # Bot protection (Cloudflare)
```

## Development Commands

```bash
make dev              # Run all apps in parallel
make build            # Build all apps
make d-up             # Start Docker Compose
make d-down           # Stop Docker Compose
pnpm install          # Install dependencies
```

## Key Technologies

### Frontend
- **Next.js 15** (merkle-pay)
- **Vite** (merkle-dashboard)
- **React 19**
- **TailwindCSS**
- **Shadcn/UI** + **Radix UI**
- **TanStack Query** (React Query)
- **TanStack Router**
- **Zustand**
- **React Hook Form**
- **Zod**

### Backend
- **Next.js API Routes** (merkle-pay)
- **Fastify** (merkle-server)
- **Prisma ORM**
- **PostgreSQL**
- **JWT** (Jose)
- **Bcryptjs** (password hashing)

### Blockchain
- **@solana/web3.js**
- **@solana/spl-token**
- **@solana/pay**

## Deployment Architecture

**Docker Compose:**
- merkle-pay: Next.js Docker image
- merkle-dashboard: Builds to static dist/, served by Caddy
- merkle-server: Fastify container
- caddy: Reverse proxy with automatic SSL (Let's Encrypt)
- PostgreSQL: Shared database

**Routes (via Caddy):**
```
/ → merkle-pay (payment form)
/api → merkle-pay (API backend)
/dashboard → merkle-dashboard (static React app)
/public/solana → merkle-server (blockchain ops)
```

## File Organization

### Merkle Pay (`apps/merkle-pay/src/`)
```
app/api/           API routes
components/        UI components (by feature)
services/          Database operations
utils/             Helper functions
types/             TypeScript + Zod schemas
hooks/             Custom React hooks
prisma/            Schema + generated client
```

### Merkle Dashboard (`apps/merkle-dashboard/src/`)
```
features/          Feature modules (auth, payments, etc.)
queries/           API fetch functions
stores/            Zustand state
components/        UI components
hooks/             Custom React hooks
```

## Payment Status Timeline

```
Created (PENDING)
    ↓ [User submits transaction]
Submitted (PROCESSED)
    ↓ [Found on chain at confirmed level]
Confirmed (CONFIRMED)
    ↓ [Reached finalized level - Solana]
Finalized (FINALIZED)
    ✓ Payment complete

Or error path:
    ↓ [tx.meta.err exists]
Failed (FAILED)
    ↓ [Refund if needed]
Refunded (REFUNDED)

Or timeout:
    ↓ [2 hours elapsed]
Expired (EXPIRED)
```

## Security Highlights

1. **Non-custodial:** Payments go directly wallet-to-wallet
2. **Type-safe:** TypeScript + Zod everywhere
3. **Validated:** Zod schemas at API boundaries
4. **Encrypted:** HTTPS only in production, passwords hashed with bcrypt
5. **Authenticated:** JWT-based session management
6. **Separated:** Clear separation of concerns across layers

## Common Patterns

### Add New Blockchain Support
1. Create token config in utils
2. Build transaction in component
3. Add API route for status checking
4. Update NEXT_PUBLIC_BLOCKCHAIN_OPTIONS
5. Implement merkle-server route if needed

### Add Dashboard Feature
1. Create feature directory in src/features/
2. Create query function in src/queries/
3. Define React Router route
4. Use TanStack Query for data fetching
5. Implement error handling with toast

### Database Migrations
1. Update prisma/schema.prisma
2. Create migration via `pnpm prisma migrate dev`
3. Deploy to production when ready

---

For comprehensive details, see **CLAUDE.md**
