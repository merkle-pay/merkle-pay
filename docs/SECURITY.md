# Security Guide

This document outlines security considerations, best practices, and implementation details for Merkle Pay.

## Security Principles

Merkle Pay follows these core security principles:

1. **Non-Custodial Design:** Never hold user funds
2. **Defense in Depth:** Multiple layers of security
3. **Least Privilege:** Minimal permissions by default
4. **Input Validation:** Validate all user inputs
5. **Secure by Default:** Safe defaults in all configurations

## Authentication & Authorization

### JWT-Based Authentication

**Implementation:** `apps/merkle-pay/src/utils/jwt.ts`

#### Access Tokens

- **Expiry:** 24 hours
- **Storage:** HTTP-only cookie
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Payload:**
  ```json
  {
    "boss_id": 123,
    "email": "user@example.com",
    "username": "user",
    "role": "boss",
    "iat": 1234567890,
    "exp": 1234654290,
    "iss": "Merkle Pay"
  }
  ```

#### Refresh Tokens

- **Expiry:** 60 days
- **Storage:** HTTP-only cookie
- **Database Tracking:** Stored in Token table for revocation
- **One-time Use:** Invalidated after refresh

#### Token Security

```typescript
// Token generation
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '24h',
  issuer: JWT_ISSUER,
  algorithm: 'HS256'
});
```

**Best Practices:**
- Use strong, random JWT_SECRET (minimum 32 characters)
- Rotate secrets regularly
- Store tokens in HTTP-only cookies (not localStorage)
- Implement token revocation via database

### Cookie Security

**Implementation:** `apps/merkle-pay/src/app/api/boss-auth/sign-in/route.ts`

```typescript
response.cookies.set('accessToken', accessToken, {
  httpOnly: true,              // Prevents XSS access
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'strict',          // CSRF protection
  maxAge: 60 * 60 * 24,        // 24 hours
  path: '/',
});
```

**Security Flags:**
- **httpOnly:** Prevents JavaScript access (XSS protection)
- **secure:** HTTPS-only transmission
- **sameSite:** Prevents CSRF attacks
- **maxAge:** Automatic expiration

## Input Validation

### Three-Layer Validation

#### 1. Client-Side Validation (React Hook Form + Zod)

```typescript
// apps/merkle-pay/src/components/pay-form/PaymentForm.tsx
const schema = z.object({
  amount: z.number().positive().min(0.01),
  recipient_address: z.string().min(32),
  token: z.enum(['USDC', 'USDT', 'SOL']),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

#### 2. Server-Side Validation (API Routes)

```typescript
// apps/merkle-pay/src/app/api/payment/init-solana/route.ts
const parsed = paymentFormDataSchema.safeParse(json);
if (!parsed.success) {
  return NextResponse.json({
    code: 400,
    data: null,
    message: fromZodError(parsed.error).message,
  });
}
```

#### 3. Database Validation (PostgreSQL Constraints)

```sql
CREATE TABLE "Payment" (
  amount              DOUBLE PRECISION NOT NULL CHECK (amount > 0),  -- Must be positive
  token               VARCHAR(50) NOT NULL,         -- Type constraint
  recipient_address   VARCHAR(255) NOT NULL,        -- Non-null constraint
  mpid                VARCHAR(50) UNIQUE NOT NULL   -- Uniqueness constraint
);
```

### Validation Rules

**Amounts:**
- Must be positive numbers
- Greater than 0.01 (minimum payment)
- Maximum limits enforced per token

**Wallet Addresses:**
- Solana: Base58 encoded, 32-44 characters
- EVM: Hex string, 42 characters (0x prefix)
- Validated using blockchain-specific libraries

**Email Addresses:**
```typescript
const emailSchema = z.string().email().max(255);
```

**Passwords:**
```typescript
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number");
```

## Password Security

### Hashing

**Implementation:** `apps/merkle-pay/src/utils/boss-auth.ts`

```typescript
import bcryptjs from 'bcryptjs';

// Hash password
const salt = await bcryptjs.genSalt(10);
const password_hash = await bcryptjs.hash(password, salt);

// Verify password
const isValid = await bcryptjs.compare(password, password_hash);
```

**Best Practices:**
- Use bcrypt with salt rounds ≥ 10
- Never store plaintext passwords
- Never log passwords
- Use timing-safe comparisons

### Password Requirements

- Minimum 8 characters
- Mix of uppercase, lowercase, numbers (recommended)
- No password reuse (future enhancement)
- Password strength meter on signup (future enhancement)

## SQL Injection Prevention

### Parameterized Queries with node-postgres

The application uses parameterized queries via `node-postgres` to prevent SQL injection:

```typescript
import { query, queryOne } from '@/lib/db';

// Safe - Parameters are properly escaped
const payment = await queryOne(
  'SELECT * FROM "Payment" WHERE mpid = $1',
  [userInput]
);

// Safe - Multiple parameters
const result = await query(
  'SELECT * FROM "Payment" WHERE status = $1 AND blockchain = $2',
  [status, blockchain]
);

// UNSAFE - Never do this:
// const unsafe = await query(`SELECT * FROM "Payment" WHERE mpid = '${userInput}'`);
```

**Best Practices:**
- Always use parameterized queries with `$1, $2, etc.` placeholders
- Never concatenate user input into SQL strings
- Use the `query` and `queryOne` helper functions from `@/lib/db`
- Validate all inputs before database operations

## XSS Prevention

### React Automatic Escaping

React automatically escapes user content:

```typescript
// Safe - React escapes by default
<div>{userInput}</div>

// Unsafe - Only use with trusted content
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

### Content Security Policy

**Implementation:** `apps/merkle-pay/src/middleware.ts`

```typescript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
);
```

**Recommended Production CSP:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.mainnet-beta.solana.com;
  frame-ancestors 'none';
```

## CSRF Protection

### SameSite Cookies

```typescript
sameSite: 'strict'  // Prevents cross-site request forgery
```

### Token-Based Protection

For state-changing operations:

```typescript
// Generate CSRF token
const csrfToken = crypto.randomBytes(32).toString('hex');

// Validate on submission
if (request.headers.get('x-csrf-token') !== storedToken) {
  return new Response('Invalid CSRF token', { status: 403 });
}
```

## Bot Protection

### Cloudflare Turnstile

**Implementation:** `apps/merkle-pay/src/middleware.ts`

```typescript
// Verify Turnstile token
const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const response = await fetch(verifyUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    secret: TURNSTILE_SECRET_KEY,
    response: token,
  }),
});
```

**Protected Routes:**
- `/api/payment/*` - Payment initialization
- `/api/boss-auth/sign-up` - User registration
- `/api/boss-auth/sign-in` - User login

**Configuration:**
```bash
TURNSTILE_SECRET_KEY=<secret>
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<public_key>
```

## Blockchain Transaction Security

### Transaction Verification

**Reference Public Key Disambiguation:**

```typescript
// Generate unique reference for each payment
const referenceKeypair = Keypair.generate();
const referencePublicKey = referenceKeypair.publicKey;

// Include in transaction
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: recipient,
    lamports: amount,
  }),
  // Reference key for tracking
  new TransactionInstruction({
    keys: [{ pubkey: referencePublicKey, isSigner: false, isWritable: false }],
    programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
    data: Buffer.from(memo),
  })
);
```

**Benefits:**
- Uniquely identifies payment on blockchain
- Prevents payment confusion
- Enables status tracking without knowing transaction ID

### Memo Field Verification

```typescript
const memo = `${businessName} -- ${orderId}`;
```

**Security:**
- Contains business name and order ID
- Stored on-chain for verification
- Cannot be tampered with after confirmation
- Enables merchant reconciliation

### Transaction Validation

```typescript
// Verify transaction on-chain
const tx = await connection.getParsedTransaction(txId, {
  commitment: 'confirmed',
});

// Check for errors
if (tx?.meta?.err) {
  status = 'FAILED';
}

// Verify amounts, recipient, token
const transfer = tx?.transaction?.message?.instructions.find(
  (ix) => ix.programId.equals(TOKEN_PROGRAM_ID)
);
```

**Validation Checklist:**
- [ ] Correct recipient address
- [ ] Correct amount (accounting for decimals)
- [ ] Correct token mint
- [ ] Transaction confirmed on-chain
- [ ] No transaction errors
- [ ] Sufficient confirmations

### Fee Security

**User Pays Gas:**
- All transaction fees paid by customer
- Merchant receives exact payment amount
- Prevents merchant fee manipulation

## Secrets Management

### Environment Variables

**Sensitive Secrets (Backend-only):**
```bash
JWT_SECRET=<strong-random-secret>
DATABASE_URL=postgresql://...
TURNSTILE_SECRET_KEY=<secret>
```

**Public Values (Frontend-safe):**
```bash
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<public_key>
NEXT_PUBLIC_BLOCKCHAIN_OPTIONS=solana,base
```

### Secret Rotation

**JWT Secret Rotation:**
1. Generate new secret
2. Update JWT_SECRET in environment
3. Invalidate all existing tokens
4. Force users to re-login

**Database Password Rotation:**
1. Create new database user
2. Grant same permissions
3. Update DATABASE_URL
4. Remove old user

### Never Commit Secrets

```gitignore
# .gitignore
.env
.env.local
.env.production
*.key
*.pem
secrets/
```

## HTTPS/TLS

### Production SSL

**Caddy Automatic HTTPS:**
```
{domain} {
    # Automatic Let's Encrypt SSL
    # No configuration needed
}
```

**Manual Certificate:**
```
{domain} {
    tls /path/to/cert.pem /path/to/key.pem
}
```

### Certificate Best Practices

- Use TLS 1.2 or higher
- Strong cipher suites only
- HSTS enabled
- Certificate pinning (advanced)

### HSTS Header

```typescript
response.headers.set(
  'Strict-Transport-Security',
  'max-age=31536000; includeSubDomains; preload'
);
```

## Rate Limiting

### API Rate Limits (Future Enhancement)

```typescript
// Example implementation
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply to routes
app.use('/api/', rateLimiter);
```

**Recommended Limits:**
- Payment initialization: 10/minute per IP
- Authentication: 5/minute per IP
- Status polling: 60/minute per payment
- Dashboard API: 100/minute per user

## Audit Logging

### Database Audit Trail

All tables include timestamps:

```sql
CREATE TABLE "Payment" (
  -- ... other columns ...
  "createdAt"  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Future Enhancements

**Audit Log Table:**
```sql
CREATE TABLE "AuditLog" (
  id          SERIAL PRIMARY KEY,
  "userId"    INTEGER,
  action      VARCHAR(100) NOT NULL,  -- "payment.create", "user.login"
  "ipAddress" VARCHAR(45),            -- IPv4 or IPv6
  "userAgent" TEXT,
  metadata    JSONB,                  -- Additional context
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Security Headers

### Recommended Headers

```typescript
// middleware.ts
response.headers.set('X-Frame-Options', 'DENY');
response.headers.set('X-Content-Type-Options', 'nosniff');
response.headers.set('X-XSS-Protection', '1; mode=block');
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
```

## Vulnerability Management

### Dependency Scanning

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

### Regular Updates

```bash
# Update dependencies
pnpm update

# Update specific packages
pnpm add pg@latest
pnpm add @types/pg@latest --save-dev
```

### Security Checklist

- [ ] All dependencies up to date
- [ ] No known vulnerabilities (pnpm audit)
- [ ] Secrets not in version control
- [ ] HTTPS enabled in production
- [ ] Strong JWT secret configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS prevention (React + CSP)
- [ ] CSRF protection (SameSite cookies)
- [ ] Bot protection (Turnstile)
- [ ] Security headers configured
- [ ] Audit logging enabled
- [ ] Regular backups configured

## Incident Response

### Security Incident Procedure

1. **Detect:** Monitor logs for suspicious activity
2. **Contain:** Disable affected endpoints/users
3. **Investigate:** Analyze logs and database
4. **Remediate:** Patch vulnerability, rotate secrets
5. **Communicate:** Notify affected users if needed
6. **Document:** Record incident and response

### Emergency Contacts

```bash
# Disable signups immediately
ENABLE_SIGNUP=NO

# Rotate JWT secret (force logout all users)
JWT_SECRET=<new-secret>

# Revoke all tokens in database
UPDATE Token SET is_valid = false;
```

## Compliance Considerations

### GDPR

- User data encrypted in transit (HTTPS)
- User data encrypted at rest (database encryption)
- Right to deletion (user account deletion)
- Data portability (export user data)

### PCI DSS

**Not applicable** - Merkle Pay is non-custodial and does not handle credit cards

### Data Retention

- Payment records: Retained indefinitely for accounting
- User accounts: Retained until deletion request
- Audit logs: Retained for 1 year (recommended)

## Related Documentation

- [API Reference](./API.md) - Authentication endpoints
- [Database Schema](./DATABASE.md) - Data models
- [Deployment](./DEPLOYMENT.md) - Production security
- [Development](./DEVELOPMENT.md) - Secure coding practices
