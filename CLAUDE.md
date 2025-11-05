# Merkle Pay Monorepo Architecture Guide

This document provides a comprehensive overview of the Merkle Pay monorepo structure, intended for AI assistants and developers to understand the codebase architecture without reading dozens of individual files.

**Recent Updates:**

- ✅ Removed `apps/merkle-server` - consolidated all blockchain logic into merkle-pay app
- ✅ Implemented Server Component + Client Component pattern for data fetching
- ✅ Fixed middleware CORS handling for same-origin requests (App Router compatibility)
- ✅ Updated type definitions for payment status API responses to include `txId`
- ✅ Improved UI consistency with Shadcn/UI card-based layouts across payment pages

## High-Level Architecture

**Merkle Pay** is a non-custodial multi-chain payment platform enabling merchants to receive stablecoin payments directly to their wallets. The monorepo uses pnpm workspaces and contains two main applications plus supporting infrastructure.

```
merkle-pay/
├── apps/
│   ├── merkle-pay          # Next.js payment form & API backend (port 8888)
│   └── merkle-dashboard    # Vite/React admin dashboard (port 9999)
├── packages/               # Shared libraries (currently empty structure)
├── caddy/                  # Reverse proxy/SSL termination
├── compose.yml             # Docker Compose orchestration
└── .env                    # Environment configuration
```

**Tech Stack Summary:**

- **Monorepo:** pnpm workspaces (v10.6.4+), Node.js 20.10+
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT-based (access + refresh tokens)
- **Blockchain Integration:** Solana, Base (EVM), Polygon (planned)

---

## 1. Core Applications

### 1.1 Merkle Pay App (`apps/merkle-pay`)

**Purpose:** Customer-facing payment form and primary API backend

**Tech Stack:**

- **Framework:** Next.js 15.2.3 (App Router)
- **UI:** Shadcn/UI + Radix UI + TailwindCSS
- **Blockchain:** Solana Web3.js, SPL Token
- **Forms:** React Hook Form + Zod validation
- **Database:** Prisma Client (PostgreSQL)
- **State Management:** Zustand
- **Port:** 8888

**Directory Structure:**

```
src/
├── app/
│   ├── api/                          # API routes
│   │   ├── payment/
│   │   │   ├── init-solana/          # POST: Initialize Solana payment
│   │   │   ├── status/               # GET: Check payment status (polling endpoint)
│   │   │   ├── txId/                 # POST: Submit transaction ID
│   │   │   └── phantom/              # Phantom wallet specific routes
│   │   ├── dashboard/                # Dashboard admin API
│   │   │   ├── payments/             # GET: Fetch payments
│   │   │   ├── businesses/           # GET: Fetch businesses
│   │   │   └── txId/                 # POST: Update tx ID
│   │   └── boss-auth/                # Authentication
│   │       ├── sign-up/              # POST: Register
│   │       ├── sign-in/              # POST: Login
│   │       ├── sign-out/             # POST: Logout
│   │       └── refresh-token/        # POST: Refresh JWT
│   ├── pay/                          # Payment flow pages (App Router)
│   │   ├── page.tsx                  # Payment form
│   │   ├── preview/                  # Payment preview & confirmation
│   │   ├── confirm/                  # Payment methods & QR code
│   │   └── status/                   # Transaction status tracking
│   │       ├── page.tsx              # Server Component (initial data fetch)
│   │       └── payment-status-client.tsx  # Client Component (polling)
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Home page
│   └── globals.css                   # Global styles
├── _pages/                           # Deprecated/legacy Pages Router code (archived)
│   ├── pay/                          # Old payment pages (migrated to app/)
│   └── phantom/                      # Phantom-specific legacy routes
├── components/
│   ├── ui/                           # Shadcn UI components
│   ├── pay-solana/                   # Solana payment components
│   ├── pay-ethereum/                 # EVM payment components
│   ├── pay-tron/                     # TRON payment components (future)
│   ├── pay-form/                     # Generic payment form
│   ├── layout/                       # Header, footer, etc.
├── types/
│   ├── payment.ts                    # Payment schema definitions
│   ├── currency.ts                   # Token/blockchain types
│   └── global.ts                     # Global window interfaces
├── utils/
│   ├── solana.ts                     # Solana blockchain helpers
│   ├── ethereum.ts                   # Ethereum/EVM helpers
│   ├── phantom.ts                    # Phantom wallet integration
│   ├── payment.ts                    # Payment utility functions
│   ├── prisma.ts                     # Prisma client singleton
│   ├── jwt.ts                        # JWT signing/verification
│   ├── boss-auth.ts                  # Authentication logic
│   └── prices.ts                     # Price/fiat conversion
├── services/
│   └── payment.ts                    # Payment DB operations
├── hooks/
│   └── use-mobile.ts                 # Responsive design hook
├── lib/
│   └── utils.ts                      # General utilities
├── queries/                          # API query logic (deprecated)
├── database/
│   └── migrations/                   # Custom migration system
└── prisma/
    ├── schema.prisma                 # Database schema definition
    └── client/                       # Generated Prisma client

tailwind.config.js                    # TailwindCSS configuration
tsconfig.json                         # TypeScript configuration
next.config.ts                        # Next.js configuration
package.json                          # Dependencies
```

**Key Configuration (Environment Variables):**

```
# Blockchain
NEXT_PUBLIC_BLOCKCHAIN_OPTIONS=solana,base
NEXT_PUBLIC_SOLANA_WALLETS=<merchant_wallets>
NEXT_PUBLIC_SOLANA_TOKEN_OPTIONS=USDT,USDC,SOL
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://...

# Auth
JWT_SECRET=<secret>
JWT_ISSUER="Merkle Pay Demo"
ENABLE_SIGNUP=YES

# Database
DATABASE_URL=postgresql://...

# Security
TURNSTILE_SECRET_KEY=<cloudflare_turnstile_key>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<public_turnstile_key>
```

---

### 1.2 Merkle Dashboard (`apps/merkle-dashboard`)

**Purpose:** Admin dashboard for merchants to view and manage payments

**Tech Stack:**

- **Framework:** Vite + React 19
- **Routing:** TanStack Router (replaces React Router)
- **UI:** Shadcn/UI + Radix UI + TailwindCSS
- **State:** Zustand for auth state, TanStack Query (React Query) for server state
- **HTTP:** Axios
- **Validation:** Zod
- **Base Path:** `/dashboard` (served by Caddy)
- **Port:** 9999 (dev), built to `/dist` for production

**Directory Structure:**

```
src/
├── main.tsx                    # App entry point with router setup
├── index.css                   # Global styles
├── features/                   # Feature-based organization
│   ├── auth/                   # Sign in, sign up, OTP, forgot password
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── otp/
│   ├── dashboard/              # Main dashboard/home
│   ├── payments/               # Payment list/tracking
│   │   └── data/
│   │       └── schema.ts       # Payment table schema
│   ├── businesses/             # Business management
│   ├── users/                  # User management
│   ├── apps/                   # App/integration management
│   ├── settings/               # User settings
│   │   ├── profile/
│   │   ├── account/
│   │   ├── create-business/
│   │   └── edit-business/
│   ├── chats/                  # Messaging/support (future)
│   └── errors/                 # Error pages (404, 500, etc.)
├── queries/                    # API query functions
│   ├── payment.ts              # fetchPayments()
│   ├── business.ts             # Business queries
│   └── mp_fetch.ts             # Wrapper around axios with auth
├── stores/                     # Zustand state stores
│   └── authStore.ts            # User auth state
├── hooks/
│   ├── use-toast.ts            # Toast notifications
│   └── use-mobile.ts           # Responsive design
├── components/
│   ├── ui/                     # Shadcn components
│   └── layout/                 # Header, sidebar, etc.
├── utils/
│   └── handle-server-error.ts  # Error handling
├── context/
│   ├── font-context.tsx        # Font provider
│   └── theme-context.tsx       # Dark/light theme
└── config/
    └── fonts.ts                # Font configuration

vite.config.ts                  # Vite configuration with base: '/dashboard'
tsconfig.json
tailwind.config.js
package.json
```

**API Integration Pattern:**

- **Base URL:** `/api` (proxied by Caddy to merkle-pay app)
- **Auth:** Cookies contain `accessToken` and `refreshToken`
- **Query Client Setup:** TanStack Query with retry logic and error handling
- **Router:** TanStack Router with basepath `/dashboard`

**Key Stores:**

- `useAuthStore`: Stores logged-in user info
- Individual feature stores for settings, preferences

---

## 2. Database Architecture

### 2.1 Database Schema (Prisma)

**File:** `apps/merkle-pay/prisma/schema.prisma`

**Core Models:**

#### **Payment Model**

Tracks every payment transaction across blockchains.

```prisma
enum PaymentStatus {
  PENDING    // Initial state, awaiting blockchain confirmation
  PROCESSED  // Payment processed but not yet confirmed
  CONFIRMED  // Transaction found on chain
  FINALIZED  // Transaction finalized (Solana confirmed/finalized)
  EXPIRED    // Payment link expired (2 hour timeout)
  FAILED     // Transaction failed on chain
  REFUNDED   // Payment was refunded
  CANCELLED  // Payment was cancelled by user
}

model Payment {
  id                  Int           @id @default(autoincrement())
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  // Amount and token
  amount              Float         // Numeric amount (e.g., 100.50)
  token               String        // Token name (USDC, USDT, SOL)
  blockchain          String        // Chain (solana, base, polygon)

  // Merchant reference
  orderId             String        // Merchant's order ID
  business_name       String        // Business display name

  // Wallet addresses
  recipient_address   String        // Where payment goes
  payer_address       String?       // Who paid (if known)

  // Tracking
  mpid                String        @unique // Merkle Pay ID (nanoid)
  referencePublicKey  String        @unique // For Solana Pay reference
  txId                String?       // Blockchain transaction hash

  // Storage
  status              PaymentStatus
  raw                 Json          // Raw payment form data
}
```

**Key Fields Explained:**

- **mpid:** Unique identifier for payment tracking (nanoid)
- **referencePublicKey:** Used in Solana Pay to identify payment via blockchain query
- **txId:** Populated after transaction is found/submitted
- **raw:** Complete payment form data as JSON backup
- **status:** State machine for payment lifecycle

#### **PhantomDeepLink Model**

Manages Phantom wallet deeplink sessions for mobile payments.

```prisma
model PhantomDeepLink {
  id                            Int      @id @default(autoincrement())
  publicKey                     String   // Payer's public key
  privateKey                    String   // Temporary private key for encryption

  mpid                          String   // Reference to Payment
  orderId                       String
  requestId                     String?
  paymentId                     Int      // Foreign key to Payment

  expiresAt                     DateTime // Session expiration
  txId                          String?

  phantom_encryption_public_key String?
  createdAt                     DateTime @default(now())
  updatedAt                     DateTime @updatedAt
}
```

#### **Boss Model**

Merchant/admin accounts.

```prisma
model Boss {
  id                  Int      @id @default(autoincrement())
  username            String   @unique
  email               String   @unique
  password_hash       String   // bcryptjs hash

  is_email_verified   Boolean  @default(false)
  avatar_image_url    String?
  backup_email        String?
  first_name          String?
  last_name           String?

  role                String   @default("boss") // Role-based access

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  tokens              Token[]  @relation("BossTokens")
}
```

#### **Business Model**

Merchant business entities.

```prisma
model Business {
  id            Int      @id @default(autoincrement())
  business_name String
  blockchain    String   // Primary blockchain

  wallets       String[] @default([])  // Array of recipient wallets
  tokens        String[] @default([])  // Supported tokens

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### **Token Model**

JWT token storage for session management.

```prisma
model Token {
  id               Int       @id @default(autoincrement())
  token            String    // JWT token value
  boss_id          Int
  boss_email       String

  is_access_token  Boolean   // True for short-lived access tokens
  is_refresh_token Boolean   // True for long-lived refresh tokens

  scope            String?
  is_valid         Boolean   @default(true)
  expiresAt        DateTime?

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  boss             Boss      @relation("BossTokens", fields: [boss_id], references: [id])
}
```

**Key Design Patterns:**

- **ACID Compliance:** PostgreSQL transactions for payment state changes
- **Referential Integrity:** Foreign keys ensure data consistency
- **Indexing:** Unique constraints on `mpid` and `referencePublicKey` for fast lookups
- **Audit Trail:** `createdAt`/`updatedAt` timestamps on all models

---

## 3. Payment Flow Architecture

### 3.1 Solana Payment Flow

**Complete Flow:**

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. PAYMENT INITIALIZATION                                           │
│    POST /api/payment/init-solana                                   │
│                                                                     │
│    Input: PaymentFormData {                                        │
│      recipient_address, amount, token, blockchain,                 │
│      orderId, returnUrl, businessName, payer, message             │
│    }                                                               │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 2. BACKEND PROCESSING (merkle-pay API)                             │
│                                                                     │
│    a) Validate inputs with Zod schema                              │
│    b) Generate ephemeral keypair for reference                     │
│    c) Create Payment DB record (status: PENDING)                   │
│    d) Generate Solana Pay URL using @solana/pay                    │
│       encodeURL({                                                  │
│         recipient: paymentRecipient,                               │
│         amount: new BigNumber(amount),                             │
│         reference: referencePublicKey,                             │
│         label, memo, message,                                      │
│         splToken: tokenMint                                        │
│       })                                                            │
│    e) Return QR code URL + metadata                                │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 3. USER PAYMENT METHODS                                             │
│                                                                     │
│    Option A: QR Code → Phantom/Solflare Mobile Wallet              │
│    Option B: Browser Extension → Phantom Chrome Extension          │
│    Option C: Deeplink → Phantom Mobile App                         │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 4. TRANSACTION SUBMISSION (Client-side)                            │
│                                                                     │
│    For SOL:                                                        │
│      - SystemProgram.transfer()                                    │
│      - Convert amount to lamports                                  │
│                                                                     │
│    For SPL Tokens (USDC, USDT):                                    │
│      - createTransferInstruction()                                 │
│      - Use associated token accounts                               │
│      - Apply decimal conversion                                    │
│                                                                     │
│    Always include:                                                 │
│      - Memo instruction with business name + orderId               │
│      - Recent blockhash                                            │
│      - Fee payer (user)                                            │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 5. TRANSACTION CONFIRMATION & TRACKING                              │
│    GET /api/payment/status?mpid=<mpid>                             │
│                                                                     │
│    a) Query DB for Payment record by mpid                          │
│    b) Check current status (skip if already settled)               │
│    c) If no txId in DB:                                            │
│       - Query Solana chain by referencePublicKey                   │
│       - findSignaturesForAddress(referencePublicKey)               │
│    d) If txId exists or found:                                     │
│       - getParsedTransaction(txId)                                 │
│       - Check commitment level: "confirmed"                        │
│    e) Analyze transaction result:                                  │
│       - If tx.meta.err: status = FAILED                            │
│       - If no error: status = CONFIRMED                            │
│    f) Update DB with txId and status                               │
│    g) Return status to client                                      │
└─────────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 6. WEBHOOK/RETURN                                                   │
│                                                                     │
│    a) Redirect to returnUrl with metadata                          │
│    b) Merchant validates payment via backend API                   │
│    c) Payment lifecycle complete                                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Key Transaction Parameters:**

| Parameter          | Description                  | Example                        |
| ------------------ | ---------------------------- | ------------------------------ |
| **amount**         | Numeric value                | `100.50`                       |
| **token**          | Token symbol                 | `USDC`, `USDT`, `SOL`          |
| **decimal**        | Token decimal places         | USDC/USDT: 6, SOL: 9           |
| **lamports/units** | Smallest unit value          | amount × 10^decimals           |
| **reference**      | Ephemeral keypair public key | Solana Pay standard            |
| **memo**           | On-chain memo text           | "Business Name -- OrderID"     |
| **commitment**     | Confirmation level           | `"confirmed"` or `"finalized"` |

**Token Configuration:**

```typescript
export const SplTokens = {
  USDC: {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },
  USDT: {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
  },
  SOL: {
    mint: "So11111111111111111111111111111111111111112",
    decimals: 9,
  },
};
```

**Timing Constants:**

```typescript
MERKLE_PAY_EXPIRE_TIME = 2 hours       // Payment link validity
POLLING_INTERVAL_MS = 2 seconds        // Status check frequency
MONITORING_TIMEOUT_MS = 90 seconds     // Maximum monitoring duration
REQUIRED_CONFIRMATION_LEVEL = "confirmed"
```

---

### 3.2 EVM (Ethereum/Base) Payment Flow

**Status:** In progress, partially implemented

**Standards:**

- **EIP-681:** Ethereum Payment Request Standard
- **Format:** `ethereum:<recipient>?value=<wei>&data=<hex>`
- **QR Code:** Encoded URI

**Future Implementation Pattern:**

```
1. Build EIP-681 URI from payment parameters
2. Add "cents trick" randomization to amount for disambiguation
3. Generate QR code with ethereum: protocol
4. Client (MetaMask, Rabby, etc.) scans and processes
5. Monitor transaction via eth_getTransactionReceipt
```

---

## 4. API Architecture

### 4.1 Authentication Flow

**JWT-Based System with Refresh Token Pattern:**

```
1. Sign In (POST /api/boss-auth/sign-in)
   ├─ Input: { username or email, password }
   ├─ Process:
   │  ├─ Fetch Boss by username/email
   │  ├─ Verify email_verified flag
   │  ├─ Compare password with bcryptjs hash
   │  └─ If valid, generate tokens
   ├─ Output: accessToken, refreshToken (cookies)
   │  ├─ accessToken: 24 hour expiry (httpOnly=true)
   │  ├─ refreshToken: 60 day expiry (httpOnly=true)
   │  └─ isAuthenticated: Non-httpOnly flag for JS
   └─ Return: User object (username, email, role, avatar)

2. API Requests
   ├─ Client sends accessToken in cookies
   ├─ Backend validates JWT signature (JWT_SECRET)
   ├─ Extract user info from token payload
   └─ Serve protected resources

3. Token Refresh (POST /api/boss-auth/refresh-token)
   ├─ Input: refreshToken (from cookie)
   ├─ Validate refreshToken
   ├─ Issue new accessToken
   └─ Return: New accessToken

4. Sign Out (POST /api/boss-auth/sign-out)
   ├─ Clear cookies
   └─ Optionally invalidate tokens in DB
```

**Token Schema (in Database):**

- **is_access_token:** Short-lived (for API auth)
- **is_refresh_token:** Long-lived (for token rotation)
- **is_valid:** Can be revoked server-side
- **expiresAt:** Token expiration timestamp

### 4.2 API Endpoints Summary

**Payment Endpoints:**

```
POST /api/payment/init-solana
  Request: { paymentFormData: PaymentFormData }
  Response: { code, data: { urlForSolanaPayQrCode, referencePublicKeyString, paymentTableRecord }, message }

GET /api/payment/status?mpid=<mpid>
  Query: mpid (Merkle Pay ID)
  Response: { code, data: { status: PaymentStatus, txId? }, message }

POST /api/payment/txId
  Request: { mpid, txId }
  Response: { code, data: null, message }
```

**Dashboard Endpoints:**

```
GET /api/dashboard/payments?page=<page>&pageSize=<size>
  Response: { code, data: { payments: Payment[], total: number }, message }

GET /api/dashboard/businesses
  Response: { code, data: { businesses: Business[] }, message }

POST /api/dashboard/txId
  Request: { mpid, txId }
  Response: Same as payment txId endpoint
```

**Authentication Endpoints:**

```
POST /api/boss-auth/sign-up
  Request: { username, email, password }
  Response: { code, data: null, message }

POST /api/boss-auth/sign-in
  Request: { username or email, password }
  Response: { code, data: { boss: BossData }, message }
  Cookies: accessToken, refreshToken, isAuthenticated

POST /api/boss-auth/sign-out
  Response: { code, data: null, message }

POST /api/boss-auth/refresh-token
  Request: { refreshToken }
  Response: { code, data: { accessToken }, message }
```

**Phantom Wallet Endpoints:**

```
GET /api/payment/phantom/dapp-encryption-public-key
  Response: { code, data: { dappEncryptionPublicKey, dappPrivateKey }, message }
```

### 4.3 Communication Between Apps

**Merkle Dashboard → Merkle Pay API:**

- Base URL: `/api` (Caddy proxies to merkle-pay:8888)
- Authentication: Cookies contain JWT tokens
- HTTP Client: Axios with custom wrapper (`mpFetch`)
- Error Handling: Global error handler in main.tsx listens for 401/403/500 errors

**Dashboard → Backend Data Flow:**

```
Component (Payments Page)
    ↓
useQuery (TanStack Query)
    ↓
fetchPayments() (queries/payment.ts)
    ↓
mpFetch() wrapper
    ↓
Axios → GET /api/dashboard/payments
    ↓
merkle-pay app API route
    ↓
Prisma query to PostgreSQL
    ↓
Response: { code, data: { payments, total }, message }
```

---

## 5. Key Architectural Patterns

### 5.1 App Router Architecture (Server & Client Components)

**Next.js App Router Pattern for Data Fetching:**

The payment flow pages use a hybrid Server Component + Client Component pattern:

**Server Component (page.tsx):**

```typescript
// app/pay/status/page.tsx
import { getPaymentByMpid, updatePaymentTxId } from "src/services/payment";

export default async function PaymentStatusPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const mpid = params.mpid;

  // Server-side data fetching (direct database access)
  const payment = await getPaymentByMpid(mpid);

  // Pass data to Client Component
  return (
    <PaymentStatusClient
      status={payment.status}
      mpid={mpid}
      txId={payment.txId}
      needPolling={!SETTLED_TX_STATUSES.has(payment.status)}
    />
  );
}
```

**Client Component (payment-status-client.tsx):**

```typescript
"use client";

export default function PaymentStatusClient({ status, mpid, txId, needPolling }) {
  // Client-side interactivity: polling, state management, user interactions
  useEffect(() => {
    if (needPolling) {
      // Poll /api/payment/status endpoint
      const interval = setInterval(fetchStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [needPolling]);

  return <div>Status: {status}</div>;
}
```

**Key Benefits:**

- **Server Components:** Fast initial load, direct database access, no client bundle
- **Client Components:** Interactive features (polling, toast notifications, copy-to-clipboard)
- **No CORS Issues:** Server-side code stays on server, client code uses same-origin API calls
- **Type Safety:** Props passed from Server to Client are fully typed

**Migration Pattern from Pages Router:**

1. `getServerSideProps` logic → Server Component async function
2. Component with `useEffect` → Client Component with `"use client"` directive
3. `next/router` imports → `next/navigation` imports
4. Pass initial data as props from Server Component to Client Component

### 5.2 Response Format Consistency

All API responses follow a standardized format:

```typescript
type ApiResponse<T> = {
  code: number; // HTTP-like status (200, 400, 401, 404, 500)
  data: T | null; // Payload or null on error
  message: string; // Human-readable message
};
```

**Example Success Response:**

```json
{
  "code": 200,
  "data": { "status": "CONFIRMED", "txId": "abc123..." },
  "message": "Transaction found and confirmed"
}
```

**Example Error Response:**

```json
{
  "code": 404,
  "data": null,
  "message": "payment not found"
}
```

### 5.3 Validation & Type Safety

**Three-Layer Validation:**

1. **Zod Schemas** (Type-safe runtime validation)

   - `PaymentFormData` schema in types/payment.ts
   - Request/response schemas in API routes
   - Database response schemas in queries

2. **TypeScript Types** (Compile-time checking)

   - Generated from Prisma models
   - Exported from utils/prisma.ts

3. **Prisma** (Database level)
   - Model definitions ensure DB schema consistency

**Example Validation Pipeline:**

```typescript
// Route handler
const parsed = paymentFormDataSchema.safeParse(json);
if (!parsed.success) {
  return NextResponse.json({
    code: 400,
    data: null,
    message: fromZodError(parsed.error).message,
  });
}
const { paymentFormData } = parsed.data;
// paymentFormData is now type-safe
```

### 5.4 State Management

**Frontend (Dashboard):**

- **Server State:** TanStack Query (React Query) with queryClient
- **Auth State:** Zustand (useAuthStore)
- **UI State:** Local React state or component-level Zustand stores

**Frontend (Payment Page):**

- **Payment State:** Zustand store for form data, QR codes, status
- **Blockchain State:** React state for wallet connection, transaction feedback

### 5.5 Middleware & CORS Handling

**Middleware Pattern (src/middleware.ts):**

The middleware handles CORS, authentication, and bot protection:

```typescript
const dealWithCors = (response: NextResponse, origin?: string | null) => {
  if (process.env.NODE_ENV !== "production") {
    // Only set CORS headers if there's an origin (cross-origin request)
    // Same-origin requests don't have an Origin header
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, mp-antibot-token"
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }
  return response;
};
```

**Key Middleware Features:**

- **CORS:** Handles cross-origin requests from dashboard (localhost:9999) to API (localhost:8888)
- **Same-Origin Support:** Doesn't require Origin header for same-origin requests (fixes App Router fetch issues)
- **Turnstile Verification:** Routes requiring `/api/payment/*`, `/api/boss-auth/*` check `mp-antibot-token`
- **JWT Authentication:** Routes under `/api/dashboard/*` validate access/refresh tokens
- **Matcher:** Applies only to `/api/:path*` routes

### 5.6 Error Handling

**Global Error Handling (Dashboard):**

```typescript
// main.tsx QueryCache configuration
queryCache: new QueryCache({
  onError: (error) => {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        // Session expired
        useAuthStore.getState().auth.signout();
        router.navigate({ to: "/sign-in" });
      }
      if (error.response?.status === 500) {
        // Server error
        router.navigate({ to: "/500" });
      }
    }
  },
});
```

**Blockchain Error Handling:**

- Transaction failures captured via `tx.meta.err`
- Status marked as FAILED in database
- User notified via toast notifications

### 5.7 Deployment & Infrastructure

**Docker Compose Orchestration (`compose.yml`):**

```yaml
Services:
├── merkle-pay
│   ├── Build: Dockerfile (Node.js + Next.js)
│   ├── Port: 8888 (internal)
│   └── Depends on: PostgreSQL
├── merkle-dashboard
│   ├── Build: Vite build → static files
│   ├── Output: /app/apps/merkle-dashboard/dist
│   └── Mounts: Named volume 'dashboard-dist'
├── caddy (Reverse Proxy)
│   ├── Ports: 80, 443 (external)
│   ├── Routes:
│   │   ├── / → merkle-pay (payment form)
│   │   ├── /api → merkle-pay (backend API)
│   │   └── /dashboard → dashboard-dist (static files)
│   └── SSL: Automatic (Let's Encrypt)
└── PostgreSQL (shared database)
    └── Persists data across restarts

Networks: merkle-network (bridge)
Volumes: dashboard-dist (build output)
```

**Environment-Specific Configs:**

- `.env` file at root (source of truth)
- Docker Compose reads via environment variables
- Next.js reads at build & runtime
- Vite reads at build time only (prefixed with VITE\_)

**Development vs Production:**

- **Dev:** `make dev` runs pnpm workspaces in parallel on localhost
  - merkle-pay: http://localhost:8888
  - merkle-dashboard: http://localhost:9999
- **Prod:** Docker Compose with Caddy routing
  - Single domain with paths

---

## 6. Important Directories & Their Purposes

### Merkle Pay App

| Directory                 | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `src/app/api`             | API route handlers (POST/GET/PUT/DELETE)        |
| `src/components`          | React UI components organized by feature        |
| `src/services`            | Business logic for data operations (DB queries) |
| `src/utils`               | Helper functions (blockchain, auth, validation) |
| `src/types`               | TypeScript interfaces and Zod schemas           |
| `src/hooks`               | Custom React hooks                              |
| `src/database/migrations` | Custom migration system (SQL files)             |
| `prisma`                  | Prisma schema and generated client              |
| `public`                  | Static assets served by Next.js                 |

### Merkle Dashboard

| Directory           | Purpose                                                     |
| ------------------- | ----------------------------------------------------------- |
| `src/features`      | Feature modules (auth, payments, dashboard, settings, etc.) |
| `src/queries`       | API query functions (fetch operations)                      |
| `src/stores`        | Zustand state management                                    |
| `src/hooks`         | Custom React hooks (useToast, useMobile, etc.)              |
| `src/components/ui` | Reusable UI components (shadcn/ui)                          |
| `src/context`       | React Context providers (theme, font)                       |
| `src/utils`         | Utility functions (error handling, logger)                  |

---

## 7. Configuration & Conventions

### Environment Variables Convention

**Naming:**

- `NEXT_PUBLIC_*`: Exposed to frontend (Next.js/Vite)
- `VITE_*`: Vite-specific variables
- Other: Backend-only secrets

**Critical Variables:**

```
DATABASE_URL               # PostgreSQL connection string
JWT_SECRET                 # Secret key for signing JWTs
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT  # Solana blockchain RPC
NEXT_PUBLIC_BLOCKCHAIN_OPTIONS   # Comma-separated chain list
```

### File Naming Conventions

- **Pages:** `page.tsx` (Next.js App Router convention)
- **Layouts:** `layout.tsx` (Next.js convention)
- **API Routes:** `route.ts` (Next.js App Router convention)
- **Components:** PascalCase: `PaymentForm.tsx`
- **Utilities:** camelCase: `solana.ts`, `payment.ts`
- **Types:** Usually paired with usage: `types/payment.ts`
- **Stores:** `*Store.ts`: `authStore.ts`

### Code Organization Principles

1. **Feature-First Structure:** Dashboard organized by features (auth, payments, etc.)
2. **Separation of Concerns:**
   - Components: UI rendering
   - Services: Data operations
   - Utils: Pure functions
   - Hooks: React logic reuse
3. **Single Responsibility:** Each file/function has one clear purpose
4. **Type Safety:** Zod + TypeScript throughout

---

## 8. Key Implementation Details

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

### Token Mint Addresses

**Solana Mainnet:**

- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` (6 decimals)
- USDT: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` (6 decimals)
- SOL: `So11111111111111111111111111111111111111112` (9 decimals)

### Associated Token Account (ATA)

For SPL token transfers, the system derives Associated Token Accounts (ATAs):

```typescript
const senderTokenAccount = await getAssociatedTokenAddress(
  tokenMint, // e.g., USDC mint
  senderPublicKey // User's wallet
);
```

This is deterministic - same user and mint always produce the same ATA.

### Phantom Wallet Integration

**Methods Supported:**

1. **QR Code (Solana Pay):** Standard @solana/pay encoding
2. **Browser Extension:** `window.phantom?.solana.signAndSendTransaction()`
3. **Mobile Deeplink:** Encrypted payload with shared secret
   - Uses NaCl box encryption
   - Params: dapp_encryption_public_key, nonce, payload, redirect_link

### Dashboard Query Pattern

```typescript
// In features/payments/index.tsx
const [{ pageIndex, pageSize }, setPagination] = useState({
  pageIndex: 0,
  pageSize: 10,
});

const { data, isPending } = useQuery({
  queryKey: ["payments", pageIndex, pageSize],
  queryFn: () => fetchPayments({ page: pageIndex, pageSize }),
  staleTime: 1000 * 60, // 1 minute
});
```

---

## 9. Common Workflows

### Adding a New API Endpoint

1. **Define Zod Schema** in `src/types/` or inline
2. **Create API Route** in `src/app/api/[path]/route.ts`
3. **Implement Handler** with:
   - Request validation (Zod)
   - Business logic (service functions)
   - Error handling (try/catch)
   - Standardized response format
4. **Export from Utils** if it's a DB operation
5. **Create Query Function** in dashboard if needed

### Adding a Dashboard Feature

1. **Create Feature Directory** in `src/features/[feature-name]/`
2. **Create Layout/Index** component
3. **Create Query Functions** in `src/queries/` if needed
4. **Define Routes** via TanStack Router file structure
5. **Add to Sidebar Navigation**
6. **Implement Auth Checks** using `useAuthStore`

### Adding Blockchain Support

1. **Add to PaymentStatus Enum** (if new states needed)
2. **Add Token Mints** to `utils/[blockchain].ts`
3. **Create Payment Component** in `components/pay-[blockchain]/`
4. **Add Transaction Builder** following Solana pattern
5. **Implement Status Checker** (API route in merkle-pay)
6. **Add to Environment Options** (NEXT_PUBLIC_BLOCKCHAIN_OPTIONS)

---

## 10. Testing & Development

### Development Server

```bash
# Install dependencies
pnpm install

# Run all dev servers in parallel
make dev

# Run individual apps
make dev-pay           # Next.js on 8888
make dev-dashboard     # Vite on 9999
```

### Building

```bash
make build              # Build all apps
make build-pay          # Build merkle-pay
make build-dashboard    # Build dashboard (Vite output)
```

### Docker Development

```bash
make d-up               # Build and start containers
make d-logs             # Tail logs
make d-restart          # Restart services
make d-down             # Stop and remove containers
```

### Database

- Uses Prisma migrations (when available)
- Custom migration system in `src/database/migrations/`
- PostgreSQL connection pooling via Neon (or local instance)

---

## 11. Security Considerations

### Secrets Management

- JWT_SECRET: Never expose, rotate regularly
- Database credentials: Via DATABASE_URL environment
- Turnstile keys: Public key in frontend, secret key backend-only
- Private keys: Temporary keys for Phantom deeplinks, never persisted

### Input Validation

- All user inputs validated with Zod
- Amount fields checked for positive numbers
- Wallet addresses validated as proper Solana/EVM addresses
- Email validation via regex
- Password minimum 8 characters

### Cookie Security

- HTTP-Only flags on sensitive tokens (accessToken, refreshToken)
- Secure flag in production (HTTPS only)
- SameSite: "strict" in production, "lax" in development
- Expiration: 24h (access), 60d (refresh)

### Transaction Verification

- Reference public key disambiguates payments
- MEMO instruction attaches business name and order ID
- Transaction fee verification (user pays gas)
- On-chain confirmation required (not just mempool)

---

## 12. Future Enhancements

**Planned Blockchains:**

- Base (EVM) - In progress
- Polygon PoS
- Arbitrum One
- Optimism
- Sui (Future)

**Planned Features:**

- Webhook notifications for payment status
- Batch payment support
- Recurring/subscription payments
- Multi-sig wallet support
- Advanced analytics dashboard
- White-label solutions
- Merchant API tokens

---

## 13. Useful Resources & Links

**Documentation:**

- Next.js: https://nextjs.org/docs
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js/
- Solana Pay: https://solanapay.com/
- Prisma: https://www.prisma.io/docs
- Fastify: https://www.fastify.io/docs/latest/
- TanStack Router: https://tanstack.com/router/latest
- TanStack Query: https://tanstack.com/query/latest

**Blockchain Explorers:**

- Solana Mainnet: https://explorer.solana.com/
- Solana Devnet: https://explorer.solana.com/?cluster=devnet

**Tools:**

- Phantom Wallet: https://phantom.app
- Solflare: https://solflare.com

---

## Final Notes

This Merkle Pay monorepo demonstrates modern full-stack Web3 application architecture:

1. **Type Safety:** TypeScript + Zod throughout
2. **Scalability:** Modular app structure, can easily add blockchains
3. **Security:** Non-custodial design, JWT auth, input validation
4. **Developer Experience:** pnpm workspaces, consistent patterns, clear separation of concerns
5. **Blockchain Integration:** Native blockchain APIs, no intermediaries
6. **Open Source:** MIT licensed, self-hostable, fully transparent

The architecture prioritizes **simplicity**, **safety**, and **extensibility** while maintaining **security** and **type safety** at every level.
