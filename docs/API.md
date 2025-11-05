# API Architecture

This document describes the Merkle Pay API architecture, authentication, and available endpoints.

## Authentication Flow

### JWT-Based System with Refresh Token Pattern

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

### Cookie Security

- HTTP-Only flags on sensitive tokens (accessToken, refreshToken)
- Secure flag in production (HTTPS only)
- SameSite: "strict" in production, "lax" in development
- Expiration: 24h (access), 60d (refresh)

## API Endpoints

### Payment Endpoints

#### Initialize Solana Payment

```
POST /api/payment/init-solana

Request:
{
  "paymentFormData": {
    "recipient_address": "string",
    "amount": number,
    "token": "USDC" | "USDT" | "SOL",
    "blockchain": "solana",
    "orderId": "string",
    "returnUrl": "string",
    "businessName": "string",
    "payer": "string",
    "message": "string"
  }
}

Response:
{
  "code": 200,
  "data": {
    "urlForSolanaPayQrCode": "string",
    "referencePublicKeyString": "string",
    "paymentTableRecord": Payment
  },
  "message": "string"
}
```

**Implementation:** `apps/merkle-pay/src/app/api/payment/init-solana/route.ts`

#### Check Payment Status

```
GET /api/payment/status?mpid=<mpid>

Query Parameters:
- mpid: Merkle Pay ID (required)

Response:
{
  "code": 200,
  "data": {
    "status": "PENDING" | "PROCESSED" | "CONFIRMED" | "FINALIZED" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUNDED",
    "txId": "string" | null
  },
  "message": "string"
}
```

**Implementation:** `apps/merkle-pay/src/app/api/payment/status/route.ts`

**Polling Pattern:**
- Poll every 2 seconds while status is PENDING/PROCESSED
- Stop polling when status reaches settled state (CONFIRMED, FINALIZED, FAILED, EXPIRED)
- Maximum polling duration: 90 seconds

#### Submit Transaction ID

```
POST /api/payment/txId

Request:
{
  "mpid": "string",
  "txId": "string"
}

Response:
{
  "code": 200,
  "data": null,
  "message": "Transaction ID updated successfully"
}
```

**Implementation:** `apps/merkle-pay/src/app/api/payment/txId/route.ts`

### Dashboard Endpoints

#### Fetch Payments

```
GET /api/dashboard/payments?page=<page>&pageSize=<size>

Query Parameters:
- page: Page index (0-based)
- pageSize: Number of items per page (default: 10)

Response:
{
  "code": 200,
  "data": {
    "payments": Payment[],
    "total": number
  },
  "message": "string"
}
```

**Implementation:** `apps/merkle-pay/src/app/api/dashboard/payments/route.ts`

**Authentication:** Requires valid JWT access token in cookies

#### Fetch Businesses

```
GET /api/dashboard/businesses

Response:
{
  "code": 200,
  "data": {
    "businesses": Business[]
  },
  "message": "string"
}
```

**Implementation:** `apps/merkle-pay/src/app/api/dashboard/businesses/route.ts`

**Authentication:** Requires valid JWT access token in cookies

#### Update Transaction ID

```
POST /api/dashboard/txId

Request:
{
  "mpid": "string",
  "txId": "string"
}

Response:
{
  "code": 200,
  "data": null,
  "message": "string"
}
```

**Implementation:** `apps/merkle-pay/src/app/api/dashboard/txId/route.ts`

**Authentication:** Requires valid JWT access token in cookies

### Authentication Endpoints

#### Sign Up

```
POST /api/boss-auth/sign-up

Request:
{
  "username": "string",
  "email": "string",
  "password": "string"
}

Response:
{
  "code": 200,
  "data": null,
  "message": "Account created successfully"
}
```

**Implementation:** `apps/merkle-pay/src/app/api/boss-auth/sign-up/route.ts`

**Validation:**
- Username: alphanumeric, 3-20 characters
- Email: valid email format
- Password: minimum 8 characters

#### Sign In

```
POST /api/boss-auth/sign-in

Request:
{
  "username": "string" | "email": "string",
  "password": "string"
}

Response:
{
  "code": 200,
  "data": {
    "boss": {
      "username": "string",
      "email": "string",
      "role": "string",
      "avatar_image_url": "string" | null
    }
  },
  "message": "Signed in successfully"
}

Cookies Set:
- accessToken (httpOnly, 24h expiry)
- refreshToken (httpOnly, 60d expiry)
- isAuthenticated (non-httpOnly, for client-side checks)
```

**Implementation:** `apps/merkle-pay/src/app/api/boss-auth/sign-in/route.ts`

#### Sign Out

```
POST /api/boss-auth/sign-out

Response:
{
  "code": 200,
  "data": null,
  "message": "Signed out successfully"
}

Cookies Cleared:
- accessToken
- refreshToken
- isAuthenticated
```

**Implementation:** `apps/merkle-pay/src/app/api/boss-auth/sign-out/route.ts`

#### Refresh Token

```
POST /api/boss-auth/refresh-token

Request:
{
  "refreshToken": "string"
}

Response:
{
  "code": 200,
  "data": {
    "accessToken": "string"
  },
  "message": "Token refreshed successfully"
}

Cookies Updated:
- accessToken (new token, 24h expiry)
```

**Implementation:** `apps/merkle-pay/src/app/api/boss-auth/refresh-token/route.ts`

### Phantom Wallet Endpoints

#### Get DApp Encryption Public Key

```
GET /api/payment/phantom/dapp-encryption-public-key

Response:
{
  "code": 200,
  "data": {
    "dappEncryptionPublicKey": "string",
    "dappPrivateKey": "string"
  },
  "message": "string"
}
```

**Implementation:** `apps/merkle-pay/src/app/api/payment/phantom/dapp-encryption-public-key/route.ts`

**Usage:** For Phantom mobile deeplink encryption

## Response Format

All API responses follow a standardized format:

```typescript
type ApiResponse<T> = {
  code: number; // HTTP-like status (200, 400, 401, 404, 500)
  data: T | null; // Payload or null on error
  message: string; // Human-readable message
};
```

**Success Example:**

```json
{
  "code": 200,
  "data": { "status": "CONFIRMED", "txId": "abc123..." },
  "message": "Transaction found and confirmed"
}
```

**Error Example:**

```json
{
  "code": 404,
  "data": null,
  "message": "payment not found"
}
```

## Middleware & CORS Handling

**Middleware Pattern:** `apps/merkle-pay/src/middleware.ts`

### Key Features

- **CORS:** Handles cross-origin requests from dashboard (localhost:9999) to API (localhost:8888)
- **Same-Origin Support:** Doesn't require Origin header for same-origin requests (fixes App Router fetch issues)
- **Turnstile Verification:** Routes requiring `/api/payment/*`, `/api/boss-auth/*` check `mp-antibot-token`
- **JWT Authentication:** Routes under `/api/dashboard/*` validate access/refresh tokens
- **Matcher:** Applies only to `/api/:path*` routes

### CORS Configuration

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

## Communication Between Apps

### Merkle Dashboard → Merkle Pay API

- **Base URL:** `/api` (Caddy proxies to merkle-pay:8888)
- **Authentication:** Cookies contain JWT tokens
- **HTTP Client:** Axios with custom wrapper (`mpFetch`)
- **Error Handling:** Global error handler in main.tsx listens for 401/403/500 errors

### Data Flow Example

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
SQL query to PostgreSQL (via node-postgres)
    ↓
Response: { code, data: { payments, total }, message }
```

## Validation & Type Safety

### Three-Layer Validation

1. **Zod Schemas** (Type-safe runtime validation)
   - `PaymentFormData` schema in types/payment.ts
   - Request/response schemas in API routes
   - Database response schemas in queries

2. **TypeScript Types** (Compile-time checking)
   - Type definitions in `types/database.ts`
   - Interface definitions for database models
   - Exported from service functions

3. **PostgreSQL** (Database level)
   - Table constraints (CHECK, NOT NULL, UNIQUE)
   - Foreign key constraints
   - Data type enforcement

### Validation Example

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

## Environment Variables

```bash
# JWT Configuration
JWT_SECRET=<secret>
JWT_ISSUER="Merkle Pay Demo"

# Sign-up Control
ENABLE_SIGNUP=YES

# Database
DATABASE_URL=postgresql://...

# Security
TURNSTILE_SECRET_KEY=<cloudflare_turnstile_key>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<public_turnstile_key>
```

## Related Documentation

- [Database Schema](./DATABASE.md) - Models and relationships
- [Payment Flow](./PAYMENT_FLOW.md) - Payment lifecycle
- [Security](./SECURITY.md) - Security considerations
- [Development](./DEVELOPMENT.md) - Adding new endpoints
