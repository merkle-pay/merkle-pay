# Cloudflare Stack Migration

Plan for consolidating Merkle Pay into a single TanStack Start project deployed to Cloudflare Workers.

## Product scope

The entire feature set:

1. **Create an order** (boss or API, scoped to a business)
2. **Generate a QR code** for the order
3. **Customer pays** the order on-chain (Solana, EVM)
4. **Boss dashboard** to manage **orders** and **customers** — across one or many **businesses**

**Deployment model:** this project is **self-hosted and single-owner**. Each deployment has exactly **one boss** (the person who deployed it) and optionally **staff accounts** created by that boss. The boss has full control; staff get a restricted operational permission set. No multi-boss, no public sign-up — staff accounts are provisioned from inside the dashboard.

**Business-level multi-tenancy:** every order, customer, and payout wallet is scoped to a specific `business_id`. The dashboard has a business switcher; all queries are filtered by the active business (plus an "All businesses" aggregate view).

Anything outside this (chats, multi-user accounts, staff roles, integrations, OTP flows, etc.) is out of scope for the first cut and will not be carried over from the current apps.

## Goals

1. **One project** — merge `apps/merkle-pay` and `apps/merkle-dashboard` into a single Vite app
2. **PostgreSQL on Neon** — Neon is the default; use `@neondatabase/serverless` HTTP driver
3. **Admin dashboard** — rename to **boss**, served at `/boss/*`
4. **Cloudflare Workers deployment** — one `wrangler deploy`, no Docker/Caddy
5. **Zustand** — keep for client state
6. **Internationalized** — Lingui from day one (web3 is global)
7. **React Compiler required** — enabled in the Vite config from the start
8. **No legacy baggage** — greenfield port; no production data to preserve

## Target stack

Modeled after `travelsfo` and `sfoparking`:

| Layer | Choice |
|---|---|
| Framework | TanStack Start (+ TanStack Router, Query, Form, Table) |
| Bundler | Vite + `@cloudflare/vite-plugin` |
| Runtime | Cloudflare Workers (`wrangler deploy`) |
| UI primitives | **Radix UI** (via shadcn/ui) |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Validation | Zod |
| DB driver | `@neondatabase/serverless` |
| Migrations | `node-pg-migrate` (plain SQL, run locally) |
| Linter/formatter | Biome |
| Tests | Vitest |
| React | 19 + React Compiler (required) |
| i18n | Lingui (`@lingui/core`, `@lingui/react`, babel macro) |

## Proposed layout

```
merkle-pay/
├── src/
│   ├── routes/                  # TanStack Router file-based routes
│   │   ├── __root.tsx
│   │   ├── index.tsx            # Landing / payment form
│   │   ├── pay/
│   │   │   ├── preview.tsx
│   │   │   ├── confirm.tsx
│   │   │   └── status.tsx
│   │   ├── boss/                # Admin (was merkle-dashboard) — orders + customers only
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx        # Overview
│   │   │   ├── orders.tsx       # Order list + detail
│   │   │   ├── orders.$id.tsx
│   │   │   ├── customers.tsx    # Customer list + detail
│   │   │   └── customers.$id.tsx
│   │   └── api/                 # Server routes (Workers handlers)
│   │       ├── order/           # create order, get status, submit txId
│   │       ├── boss-auth/       # boss sign-in / sign-out / refresh
│   │       └── boss/            # orders + customers admin endpoints
│   ├── components/              # shadcn + feature components
│   ├── lib/                     # db, auth, jwt, solana, ethereum, turnstile
│   ├── server/                  # server-only code (DB queries, JWT signing)
│   ├── stores/                  # Zustand stores
│   └── types/
├── migrations/                  # node-pg-migrate SQL files
├── seeds/                       # 001_boss.sql, 002_*.sql — run by scripts/run-seed.ts
├── locales/                     # Lingui message catalogs (en, zh, es, ...)
├── lingui.config.ts
├── public/
├── scripts/                     # run-seed.ts, hash-password.ts, prebuild.sh, ...
├── wrangler.jsonc
├── vite.config.ts
├── biome.json
├── tsconfig.json
└── package.json
```

## Key migrations

### 1. Database driver

- **From:** `node-postgres` (`pg`) over TCP to a self-hosted Postgres container
- **To:** `@neondatabase/serverless` over HTTP to a Neon branch
- **Why:** Workers has no TCP sockets. Neon's HTTP driver is designed for Workers and reuses the same `postgres://` URL format.
- Keep the existing SQL schema. Rewrite `src/lib/db.ts` around `neon(DATABASE_URL)` instead of `Pool`.

### 2. Password hashing

- **From:** `bcrypt` (native module, won't build for Workers)
- **To:** **PBKDF2-SHA256 via Web Crypto** (100k iterations, 16-byte salt, 32-byte hash, stored as `salt:hash` hex) — matches the `travelsfo` pattern
- Pure Web Crypto, zero dependencies, Workers-native
- Offline hash generation via `scripts/hash-password.ts` for seeding
- No rehash-on-login migration needed since there's no production data

### 3. Framework & routing

- **From:** Next.js App Router (merkle-pay) + Vite + React Router / TanStack Router (dashboard)
- **To:** TanStack Start with file-based routing under `src/routes/`
- Next.js API routes → TanStack Start API routes or `createServerFn` server functions
- Server Components that fetch data → TanStack Router route `loader`s
- Middleware (`src/middleware.ts`) → TanStack Start middleware or a small wrapper in route handlers for Turnstile / JWT verification

### 4. Caddy & Docker

- Remove `caddy/`, `compose.yml`, `Makefile` (or slim to dev-only targets)
- Static assets, SSL, and HTTP/3 all handled by Cloudflare
- DB is Neon (managed), no more Postgres container

### 5. Secrets

- **Do not** check secrets into `wrangler.jsonc`. Use `wrangler secret put` for:
  `DATABASE_URL`, `JWT_SECRET`, `TURNSTILE_SECRET_KEY`, any RPC keys with quota
- Leave only **public** config in `vars` (public Turnstile site key, public RPC endpoints, `JWT_ISSUER`, blockchain options)

### 6. Blockchain libs

- `@solana/web3.js`, `@solana/spl-token`, `@solana/pay` — expected to work on Workers with `nodejs_compat`, but spike early to catch Buffer / crypto edges
- Phantom deeplink encryption (`tweetnacl`) — pure JS, fine on Workers

## Data model (greenfield)

The current schema is centered on `Payment`. The new product language is **Order** and **Customer**, so the schema is reshaped rather than carried over verbatim.

**Schema policy: no foreign keys.** Relationships are represented as plain id columns (e.g. `business_id`, `customer_id`). Referential integrity is enforced in application code, not the database. Plain indexes still go on every `*_id` column for query performance.

**No `boss_id` anywhere.** The deployment has exactly one boss, so there's no need to disambiguate which boss owns what. Staff accounts get a `user_id` (when needed for audit), but never a `boss_id`.

Core tables (first cut):

- **`boss`** — the single owner account (email, password hash, timestamps). Logically one row; the `/boss/install` route and any seed script must refuse to create a second.
- **`staff`** — 0..N staff accounts created by the boss (email, password hash, optional `display_name`, `disabled_at`, timestamps, **`business_ids UUID[]`**). Separate table to make the "exactly one boss" invariant structural rather than a role column. Business access is stored **inline as a `UUID[]` array** (ids, not names) with a GIN index — no `staff_business_access` join table. Grant/revoke is a read-modify-write on the row; acceptable since the single boss is the only editor.
- **`business`** — merchant entity (name, supported chains/tokens, payout wallets). No owner column; implicitly owned by the boss.
- **`customer`** — payer identity scoped to a business via `business_id` (plain id, indexed); dedup key is a unique index on `(business_id, wallet_address)` and/or `(business_id, email)`
- **`order`** — a payment request scoped to a business via `business_id` (required, indexed): amount, token, chain, status state machine, `mpid`, `reference_public_key`, optional `customer_id`, `tx_id`, timestamps, optional `created_by_staff_id` (nullable — null means created by the boss or via public API)
- **`token`** — JWT access/refresh tracking. Each row carries `actor_type` (`'boss' | 'staff'`) and `actor_id` so sessions can be revoked per user.
- **`phantom_deeplink`** — Phantom mobile session, linked by `order_id`

**Permissions (first cut):**
- **Boss:** everything — manage businesses, payout wallets, staff, refunds, settings, plus all staff capabilities.
- **Staff:** view and create orders, view customers, view payments. No access to: creating/editing businesses, payout wallets, refunds, other staff, or global settings.

**Tenancy rule:** every dashboard query and every public order endpoint still filters by `business_id`. The active business comes from the URL (`/boss/b/:businessId/...`) or a cookie. Since FKs don't enforce this at the DB layer, the app layer is the only line of defense — audit every query. Permission checks run on top of tenancy checks (is this actor allowed to do X on business Y?).

**Bootstrap:** the boss is provisioned via **seed SQL files**, following the `travelsfo` pattern:

```
seeds/
├── 001_boss.sql            # single boss row (INSERT ... ON CONFLICT DO NOTHING)
├── 002_business_*.sql      # default businesses
└── 003_*.sql               # other seed data
```

Runner: `scripts/run-seed.ts` (reads one `.sql` file, executes it against `DATABASE_URL` via `@neondatabase/serverless`). Usage: `npx tsx scripts/run-seed.ts seeds/001_boss.sql`.

Password hashing: PBKDF2-SHA256 via Web Crypto (100k iterations, 16-byte salt, 32-byte hash, stored as `salt:hash` hex). Generated offline by `scripts/hash-password.ts` and baked into the seed file. No `bcrypt`/`bcryptjs` anywhere.

Staff accounts are always created from inside the dashboard by the boss; there is no public staff sign-up and no seed files for staff.

Status state machine stays the same: `PENDING → PROCESSED → CONFIRMED → FINALIZED` plus `EXPIRED / FAILED / CANCELLED / REFUNDED`.

Since there's no production data, migrations can start from a clean `0001_initial.sql` — no need to port existing rows or preserve old column names.

## Migration phases

1. **Spike** — scratch TanStack Start app that boots on Workers, connects to a throwaway Neon DB, runs a `SELECT 1`
2. **Scaffold** — create the new project layout with Biome, Vitest, Tailwind 4, shadcn (Radix variant), Zustand, routes shell
3. **Port DB + auth** — move schema + SQL queries; rewrite hashing path; get `/api/boss-auth/*` working
4. **Port payment flow** — `/`, `/pay/*`, `/api/payment/*`; verify Solana Web3.js on Workers
5. **Port boss dashboard** — `/boss/*` with TanStack Query against the new API; bring over features one at a time (payments, businesses, users, settings)
6. **Cutover** — switch DNS to the Workers route, retire Docker/Caddy stack, delete `apps/` and `archive/`

## Decisions

- **Greenfield cutover** — open-source project, no production data to preserve. Schema and code are rebuilt fresh.
- **Neon as default DB** — serverless Postgres via `@neondatabase/serverless`. Specific region/plan TBD at setup time.
- **Lingui i18n from day one** — web3 is global; ship English catalog first, add locales as translations arrive.
- **React Compiler enabled** — configured in `vite.config.ts` via `babel-plugin-react-compiler` from the initial commit.
- **All legacy deleted** — `apps/`, `archive/`, `caddy/`, `compose.yml`, `Makefile`, `migrate/`, `_pages/`, `merkle-server` references. The old code lives in git history.

## Still to decide (per-phase, small)

- ~~Chain support in first cut~~ — **decided:** Solana only. Base/EVM and others are post-launch.

### Future chains — notes

- **Base / EVM** — EIP-681 payment URLs, standard across MetaMask/Rabby/etc. Straightforward to add.
- **Sui** — no ecosystem-wide payment standard equivalent to Solana Pay as of early 2026. Mysten Labs' Slush wallet supports deep links (`slush://` + universal links at `my.slush.app`) and Suiet has its own scheme, but there is no cross-wallet spec. Adding Sui will mean a custom flow (likely Slush deep links + manual transaction polling), not a drop-in SDK. Feasible, but more build than Base.
- ~~Boss bootstrap mechanism~~ — **decided:** seed SQL files under `seeds/`, run by `scripts/run-seed.ts` (same pattern as `travelsfo`). Password pre-hashed with PBKDF2 via `scripts/hash-password.ts`.
- ~~Staff-to-business scope~~ — **decided:** `staff.business_ids UUID[]` inline with a GIN index; no join table.
- ~~Locale list~~ — **decided:** 10 locales matching `travelsfo`: `en` (source), `de`, `zh`, `zh-Hant`, `ja`, `ko`, `es`, `fr`, `pt`, `ru`.
