# Development Guide

This guide covers development workflows, setup, testing, and common tasks for Merkle Pay.

## Prerequisites

- **Node.js:** 20.10+
- **pnpm:** 10.6.4+
- **PostgreSQL:** 14+ (or use Neon cloud database)
- **Docker:** (optional, for containerized development)

## Initial Setup

### 1. Install Dependencies

```bash
# Install pnpm globally if not already installed
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/merkle_pay

# JWT
JWT_SECRET=your-secret-key-here
JWT_ISSUER="Merkle Pay Demo"

# Blockchain
NEXT_PUBLIC_BLOCKCHAIN_OPTIONS=solana,base
NEXT_PUBLIC_SOLANA_WALLETS=<your-wallet-addresses>
NEXT_PUBLIC_SOLANA_TOKEN_OPTIONS=USDT,USDC,SOL
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Security
TURNSTILE_SECRET_KEY=<cloudflare-turnstile-secret>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<cloudflare-turnstile-public-key>

# Auth
ENABLE_SIGNUP=YES
```

### 3. Database Setup

```bash
# Navigate to merkle-pay app
cd apps/merkle-pay

# Run database migrations
pnpm db:migrate

# Or manually run SQL migration files from src/database/migrations/
```

## Development Server

### Running All Apps

```bash
# From root directory
make dev
```

This starts:
- **merkle-pay:** http://localhost:8888
- **merkle-dashboard:** http://localhost:9999

### Running Individual Apps

```bash
# Run merkle-pay only
make dev-pay

# Run merkle-dashboard only
make dev-dashboard
```

### Manual Commands

```bash
# merkle-pay
cd apps/merkle-pay
pnpm dev

# merkle-dashboard
cd apps/merkle-dashboard
pnpm dev
```

## Building

### Build All Apps

```bash
make build
```

### Build Individual Apps

```bash
# Build merkle-pay
make build-pay

# Build dashboard
make build-dashboard
```

### Manual Build Commands

```bash
# merkle-pay (Next.js)
cd apps/merkle-pay
pnpm build

# merkle-dashboard (Vite)
cd apps/merkle-dashboard
pnpm build
```

## Docker Development

### Start Containers

```bash
# Build and start all services
make d-up

# Start in detached mode
docker compose up -d
```

### View Logs

```bash
# All services
make d-logs

# Specific service
docker compose logs -f merkle-pay
docker compose logs -f merkle-dashboard
```

### Restart Services

```bash
# Restart all
make d-restart

# Restart specific service
docker compose restart merkle-pay
```

### Stop and Clean Up

```bash
# Stop and remove containers
make d-down

# Remove volumes too
docker compose down -v
```

## Common Workflows

### Adding a New API Endpoint

1. **Define Zod Schema** in `apps/merkle-pay/src/types/` or inline

```typescript
// apps/merkle-pay/src/types/myfeature.ts
import { z } from "zod";

export const myRequestSchema = z.object({
  field1: z.string(),
  field2: z.number(),
});

export type MyRequest = z.infer<typeof myRequestSchema>;
```

2. **Create API Route** in `apps/merkle-pay/src/app/api/[path]/route.ts`

```typescript
// apps/merkle-pay/src/app/api/myfeature/route.ts
import { NextRequest, NextResponse } from "next/server";
import { myRequestSchema } from "@/types/myfeature";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = myRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({
        code: 400,
        data: null,
        message: "Invalid request",
      });
    }

    // Business logic here

    return NextResponse.json({
      code: 200,
      data: { result: "success" },
      message: "Operation completed",
    });
  } catch (error) {
    return NextResponse.json({
      code: 500,
      data: null,
      message: "Internal server error",
    });
  }
}
```

3. **Create Service Function** (if needed)

```typescript
// apps/merkle-pay/src/services/myfeature.ts
import { queryOne } from "@/lib/db";

export async function doSomething(data: MyRequest) {
  return await queryOne(
    'INSERT INTO "MyModel" (field1, field2, "createdAt", "updatedAt") VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *',
    [data.field1, data.field2]
  );
}
```

4. **Create Query Function** in dashboard (if needed)

```typescript
// apps/merkle-dashboard/src/queries/myfeature.ts
import { mpFetch } from "./mp_fetch";

export async function fetchMyFeature(params: any) {
  const response = await mpFetch.post("/api/myfeature", params);
  return response.data;
}
```

### Adding a Dashboard Feature

1. **Create Feature Directory**

```bash
mkdir -p apps/merkle-dashboard/src/features/myfeature
```

2. **Create Components**

```typescript
// apps/merkle-dashboard/src/features/myfeature/index.tsx
import { useQuery } from "@tanstack/react-query";
import { fetchMyFeature } from "@/queries/myfeature";

export default function MyFeature() {
  const { data, isPending } = useQuery({
    queryKey: ["myfeature"],
    queryFn: fetchMyFeature,
  });

  if (isPending) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Feature</h1>
      {/* Feature content */}
    </div>
  );
}
```

3. **Create Route** using TanStack Router

```typescript
// apps/merkle-dashboard/src/routes/myfeature/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import MyFeature from "@/features/myfeature";

export const Route = createFileRoute("/myfeature")({
  component: MyFeature,
});
```

4. **Add to Navigation**

```typescript
// apps/merkle-dashboard/src/components/layout/sidebar.tsx
// Add navigation item
{
  title: "My Feature",
  url: "/dashboard/myfeature",
  icon: MyIcon,
}
```

### Adding Blockchain Support

1. **Update Environment Variables**

```bash
NEXT_PUBLIC_BLOCKCHAIN_OPTIONS=solana,base,mynewchain
```

2. **Create Utility Functions**

```typescript
// apps/merkle-pay/src/utils/mynewchain.ts
export const MyChainTokens = {
  USDC: {
    address: "0x...",
    decimals: 6,
  },
};

export async function buildTransaction(params: any) {
  // Transaction building logic
}

export async function checkTransactionStatus(txId: string) {
  // Status checking logic
}
```

3. **Create Payment Component**

```bash
mkdir -p apps/merkle-pay/src/components/pay-mynewchain
```

```typescript
// apps/merkle-pay/src/components/pay-mynewchain/PayButton.tsx
export default function MyChainPayButton({ payment }: Props) {
  // Payment logic
}
```

4. **Create API Route**

```typescript
// apps/merkle-pay/src/app/api/payment/init-mynewchain/route.ts
export async function POST(request: NextRequest) {
  // Initialize payment
}
```

5. **Add Status Checker** to existing status route

```typescript
// apps/merkle-pay/src/app/api/payment/status/route.ts
// Add case for mynewchain
if (blockchain === "mynewchain") {
  // Check transaction status
}
```

### Database Schema Changes

1. **Create SQL Migration File**

```sql
-- apps/merkle-pay/src/database/migrations/YYYYMMDD_add_new_model.sql
CREATE TABLE "NewModel" (
  id        SERIAL PRIMARY KEY,
  field1    VARCHAR(255) NOT NULL,
  field2    INTEGER NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

2. **Run Migration**

```bash
cd apps/merkle-pay
pnpm db:migrate

# Or run manually via psql
psql $DATABASE_URL -f src/database/migrations/YYYYMMDD_add_new_model.sql
```

3. **Update TypeScript Types** (if needed)

```typescript
// apps/merkle-pay/src/types/database.ts
export interface NewModel {
  id: number;
  field1: string;
  field2: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Code Quality

### Linting

```bash
# merkle-pay
cd apps/merkle-pay
pnpm lint

# merkle-dashboard
cd apps/merkle-dashboard
pnpm lint
```

### Type Checking

```bash
# merkle-pay
cd apps/merkle-pay
pnpm tsc --noEmit

# merkle-dashboard
cd apps/merkle-dashboard
pnpm tsc --noEmit
```

## Debugging

### Next.js App (merkle-pay)

1. Add debug configuration to VS Code:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Next.js: debug server-side",
  "runtimeExecutable": "${workspaceFolder}/apps/merkle-pay/node_modules/.bin/next",
  "runtimeArgs": ["dev"],
  "console": "integratedTerminal",
  "serverReadyAction": {
    "pattern": "started server on .+, url: (https?://.+)",
    "uriFormat": "%s",
    "action": "debugWithChrome"
  }
}
```

2. Set breakpoints and start debugging

### Vite App (merkle-dashboard)

1. Use browser DevTools
2. Add `debugger` statements in code
3. Use React DevTools extension

### Database Queries

```bash
# Connect to database via psql
psql $DATABASE_URL

# Or use a GUI tool like:
# - pgAdmin (https://www.pgadmin.org/)
# - DBeaver (https://dbeaver.io/)
# - TablePlus (https://tableplus.com/)
```

**Example queries:**
```sql
-- View all payments
SELECT * FROM "Payment" ORDER BY "createdAt" DESC LIMIT 10;

-- Check payment status
SELECT mpid, status, "txId" FROM "Payment" WHERE mpid = 'your-mpid';
```

## Testing

### Manual Testing Checklist

**Payment Flow:**
- [ ] Initialize payment on /pay
- [ ] Preview payment details
- [ ] Generate QR code
- [ ] Submit transaction (Phantom/wallet)
- [ ] Check status updates
- [ ] Verify database record

**Dashboard:**
- [ ] Sign up new account
- [ ] Sign in with credentials
- [ ] View payments list
- [ ] View payment details
- [ ] Search/filter payments
- [ ] Token refresh on expiry

**API:**
- [ ] Test with Postman/Insomnia
- [ ] Verify response formats
- [ ] Test error cases
- [ ] Check authentication

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 8888
lsof -ti:8888 | xargs kill -9

# Kill process on port 9999
lsof -ti:9999 | xargs kill -9
```

**Database Connection Issues:**
```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

**Module Not Found:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules
pnpm install
```

**Query Errors:**
```bash
# Check SQL syntax and parameter placeholders
# Ensure using $1, $2 format (not ?)
# Verify table and column names match database schema
```

**Build Errors:**
```bash
# Clear Next.js cache
cd apps/merkle-pay
rm -rf .next

# Clear Vite cache
cd apps/merkle-dashboard
rm -rf dist node_modules/.vite
```

## File Naming Conventions

- **Pages:** `page.tsx` (Next.js App Router)
- **Layouts:** `layout.tsx` (Next.js)
- **API Routes:** `route.ts` (Next.js App Router)
- **Components:** PascalCase: `PaymentForm.tsx`
- **Utilities:** camelCase: `solana.ts`, `payment.ts`
- **Types:** `types/payment.ts`
- **Stores:** `authStore.ts`

## Code Organization Principles

1. **Feature-First Structure:** Dashboard organized by features
2. **Separation of Concerns:**
   - Components: UI rendering
   - Services: Data operations
   - Utils: Pure functions
   - Hooks: React logic reuse
3. **Single Responsibility:** Each file/function has one purpose
4. **Type Safety:** Zod + TypeScript throughout

## Related Documentation

- [API Reference](./API.md) - API endpoints
- [Database Schema](./DATABASE.md) - Database models
- [Deployment](./DEPLOYMENT.md) - Production deployment
- [Security](./SECURITY.md) - Security best practices
