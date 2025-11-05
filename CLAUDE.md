# Merkle Pay Monorepo Architecture Guide

This document provides a comprehensive overview of the Merkle Pay monorepo structure, intended for AI assistants and developers to understand the codebase architecture without reading dozens of individual files.

**Documentation Structure:**

For detailed information on specific topics, see the following documents in the `docs/` directory:

- **[Database Architecture](./docs/DATABASE.md)** - Database schema, models, and design patterns
- **[Payment Flow](./docs/PAYMENT_FLOW.md)** - Complete payment flow for Solana and EVM chains
- **[API Reference](./docs/API.md)** - API endpoints, authentication, and communication patterns
- **[Development Guide](./docs/DEVELOPMENT.md)** - Setup, workflows, and common development tasks
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment and infrastructure
- **[Security Guide](./docs/SECURITY.md)** - Security considerations and best practices
- **[Architecture Summary](./docs/ARCHITECTURE_SUMMARY.md)** - High-level system overview

**Recent Updates:**

- ✅ Extracted detailed documentation into focused docs/ files
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
- **Database:** PostgreSQL with direct SQL queries (node-postgres)
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
- **Database:** PostgreSQL with node-postgres (direct SQL)
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
├── lib/
│   ├── db.ts                         # Database connection (node-postgres)
│   └── db-compat.ts              # Compatibility layer for migration
├── utils/
│   ├── solana.ts                     # Solana blockchain helpers
│   ├── ethereum.ts                   # Ethereum/EVM helpers
│   ├── phantom.ts                    # Phantom wallet integration
│   ├── payment.ts                    # Payment utility functions
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
└── database/
    └── migrations/                   # SQL migration files

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

> **📖 For detailed database documentation, see [Database Architecture](./docs/DATABASE.md)**

**Schema Location:** `apps/merkle-pay/src/database/migrations/` (SQL files)

**Core Models:**
- **Payment** - Tracks payment transactions with status state machine (PENDING → PROCESSED → CONFIRMED → FINALIZED)
- **Boss** - Merchant/admin accounts with JWT token relations
- **Business** - Merchant business entities with supported wallets and tokens
- **Token** - JWT token storage for access/refresh token management
- **PhantomDeepLink** - Phantom wallet mobile deeplink sessions

**Key Features:**
- PostgreSQL with direct SQL queries via `node-postgres`
- Unique payment tracking via `mpid` (nanoid) and `referencePublicKey`
- Comprehensive audit trail with timestamps
- ACID compliance for payment state changes

---

## 3. Payment Flow Architecture

> **📖 For detailed payment flow documentation, see [Payment Flow](./docs/PAYMENT_FLOW.md)**

**Solana Payment Flow:**
1. **Initialization** - POST /api/payment/init-solana validates input, generates reference keypair, creates Payment record
2. **User Payment** - QR Code, Browser Extension, or Mobile Deeplink via Phantom/Solflare
3. **Transaction** - SOL or SPL token transfer with memo instruction
4. **Confirmation** - Status polling via /api/payment/status, on-chain verification
5. **Return** - Redirect to merchant with payment metadata

**Key Features:**
- Solana Pay standard with @solana/pay library
- Reference public key for unique payment tracking
- Status polling (2s interval, 90s max) with confirmed/finalized commitment levels
- Support for SOL, USDC, USDT (6-9 decimal tokens)
- Payment link expiry: 2 hours

**EVM (Base/Ethereum) Flow:** (In progress)
- EIP-681 payment request standard
- QR code generation for MetaMask/Rabby wallets
- Transaction monitoring via eth_getTransactionReceipt

---

## 4. API Architecture

> **📖 For detailed API documentation, see [API Reference](./docs/API.md)**

**Authentication:**
- JWT-based with access (24h) and refresh (60d) tokens
- HTTP-only cookies for security
- Token refresh pattern with database tracking
- Bcrypt password hashing

**Main API Endpoints:**
- `POST /api/payment/init-solana` - Initialize payment
- `GET /api/payment/status` - Poll payment status
- `POST /api/boss-auth/sign-in` - User authentication
- `GET /api/dashboard/payments` - Fetch payments (paginated)
- `GET /api/dashboard/businesses` - Fetch businesses

**Response Format:**
```typescript
{ code: number, data: T | null, message: string }
```

**Communication:**
- Dashboard → API via Caddy proxy at `/api`
- TanStack Query for server state
- Axios with auth wrapper (`mpFetch`)
- Global error handling for 401/403/500

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

   - Type definitions in `src/types/database.ts`
   - Interface definitions for database models

3. **PostgreSQL** (Database level)
   - Table constraints (CHECK, NOT NULL, UNIQUE)
   - Foreign key constraints

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

> **📖 For detailed deployment documentation, see [Deployment Guide](./docs/DEPLOYMENT.md)**

**Production Stack:**
- **Caddy** - Reverse proxy with automatic HTTPS (ports 80, 443)
- **merkle-pay** - Next.js app (port 8888 internal)
- **merkle-dashboard** - Vite static files served by Caddy
- **PostgreSQL** - Persistent database

**Routing:**
- `/` → Payment form (Next.js)
- `/api` → Backend API (Next.js)
- `/dashboard` → Admin SPA (static files)

**Development:**
- `make dev` - Run both apps locally (ports 8888, 9999)
- `make build` - Build all applications
- `make d-up` - Start Docker Compose

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
| `src/database/migrations` | SQL migration files                             |
| `src/lib`                 | Database connection and query helpers           |
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

## 9. Development

> **📖 For detailed development guide, see [Development Guide](./docs/DEVELOPMENT.md)**

**Quick Start:**
```bash
pnpm install           # Install dependencies
make dev               # Run both apps (8888, 9999)
make build             # Build all apps
```

**Common Workflows:**
- **Add API Endpoint:** Define Zod schema → Create route in `src/app/api/` → Implement handler
- **Add Dashboard Feature:** Create feature directory → Create components → Define routes → Add navigation
- **Add Blockchain:** Add token mints → Create payment component → Implement status checker

**Database:**
```bash
cd apps/merkle-pay
pnpm db:migrate            # Run migrations
pnpm db:seed               # Seed database (if needed)
```

---

## 10. Security

> **📖 For detailed security documentation, see [Security Guide](./docs/SECURITY.md)**

**Key Security Features:**
- **Authentication:** JWT with refresh tokens, bcrypt password hashing, HTTP-only cookies
- **Input Validation:** Three-layer validation (Zod, TypeScript, PostgreSQL)
- **Bot Protection:** Cloudflare Turnstile on payment/auth routes
- **Transaction Security:** Reference public key disambiguation, on-chain memo verification
- **CORS & CSP:** Proper cross-origin and content security policies
- **Secrets:** Environment-based, never committed to version control

**Best Practices:**
- XSS prevention via React auto-escaping
- SQL injection prevention via parameterized queries (node-postgres)
- CSRF protection via SameSite cookies
- HTTPS-only in production with automatic SSL (Caddy)

---

## 11. Resources & Links

**📖 Documentation:**
- [Database Architecture](./docs/DATABASE.md)
- [Payment Flow](./docs/PAYMENT_FLOW.md)
- [API Reference](./docs/API.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Guide](./docs/SECURITY.md)

**🔗 External Resources:**
- [Next.js](https://nextjs.org/docs)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Solana Pay](https://solanapay.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [TanStack Router](https://tanstack.com/router/latest)

**🚀 Roadmap:**
- Base (EVM) integration - In progress
- Polygon PoS, Arbitrum One, Optimism
- Webhook notifications
- Recurring payments
- Advanced analytics

---

## Summary

Merkle Pay is a **non-custodial multi-chain payment platform** built with modern full-stack Web3 architecture:

- ✅ **Type Safe:** TypeScript + Zod + PostgreSQL
- ✅ **Scalable:** Modular monorepo structure
- ✅ **Secure:** JWT auth, input validation, bot protection
- ✅ **Non-Custodial:** Direct wallet-to-wallet payments
- ✅ **Developer Friendly:** Clear patterns, comprehensive docs

For detailed information, see the [docs/](./docs/) directory.
