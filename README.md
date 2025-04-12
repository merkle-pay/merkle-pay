# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Accept stablecoin payments on Solana, Polygon, Arbitrum, and zkSync with ease—built for creators, indie hackers, and small businesses.**

Merkle Pay is a non-custodial web platform enabling users to quickly set up payment pages for receiving stablecoins like USDT and USDC directly to their own wallets on **multiple blockchains**.

Leveraging native blockchain payment standards (like Solana Pay and EIP-681), it offers fast transactions, extremely low network fees, and a smooth user experience across all supported chains.

Merkle Pay is fully open-source under the [MIT license](LICENSE).

---

## Supported Blockchains (v1)

Merkle Pay aims to provide a seamless payment experience across high-throughput, low-fee networks:

- ✅ **Solana**
- ✅ **Polygon PoS** _(Coming Soon)_
- ✅ **Arbitrum One** _(Coming Soon)_
- ✅ **zkSync Era** _(Coming Soon)_

_(Support for additional chains may be added in the future.)_

---

## Supported Wallets (v1 - Solana Focus)

Wallet compatibility ensures a smooth payment experience for your customers.

- ✅ **Phantom**: Recommended for both desktop (via QR code) and mobile (via deeplinking). Excellent Solana Pay support.
- ✅ **Solflare**: Recommended for both desktop and mobile. Strong Solana Pay support.
- **Other Solana Wallets**: Wallets implementing the Solana Pay standard _should_ be compatible, but Phantom and Solflare are the primary tested wallets for v1.
- **EVM Wallets (MetaMask, etc.)**: Support for EVM wallets will be detailed as Polygon, Arbitrum, and zkSync integration is completed.

## Features (v1)

- **Multi-Chain Support**: Accept payments on Solana and leading Ethereum Layer 2 networks (Polygon, Arbitrum, zkSync Era).
- **Instant Setup**: Enter your wallet address(es) and business name—get a payment page ready in minutes.
- **Non-Custodial**: Payments go directly from the payer's wallet to your specified wallet address. Merkle Pay never holds your funds.
- **Native Payment Standards**: Uses Solana Pay for Solana and EIP-681 URI schemes for EVM chains (Polygon, Arbitrum, zkSync).
- **Smart Display**: Generates QR codes and clickable payment links compatible with popular wallets on each supported chain (e.g., Phantom, MetaMask).
- **Reliable Tracking**: Uses unique on-chain identifiers (`reference` key on Solana, potentially event emission via contracts on EVM) for robust backend verification. Includes optional `orderId` mapping.
- **Real-time Status**: Payment status page with real-time updates (WebSocket recommended).
- **Stablecoin Focus**: Designed primarily for USDT, USDC, and other major stablecoins native to or bridged across the supported chains.
- **Open-Source & Self-Hostable**: Deploy using Docker or manually deploy to platforms like Vercel.

---

## Getting Started

### Prerequisites

- **Node.js**: v22+ recommended
- **PNPM**: v9+ recommended (or npm/yarn)
- **Docker**: Required for the easiest local setup and deployment using the provided `docker-compose.yml`.
- **PostgreSQL**: A running instance (local or hosted). Needed for storing merchant and payment request data.
- **Web3 Wallet**:
  - **Solana:** Phantom, Solflare, etc.
  - **EVM (Polygon/Arbitrum/zkSync):** MetaMask, Rabby, Frame, etc.

### Why PostgreSQL?

- **Data Integrity**: Relational structure and constraints (like Foreign Keys) ensure data consistency, crucial for linking payments to merchants accurately across different chains.
- **Transactional Reliability (ACID)**: Guarantees that operations (like updating payment status) complete fully or not at all, vital for financial applications.
- **Structured Querying**: SQL provides powerful and standard ways to query and analyze payment data as the platform grows.
- **Mature Ecosystem**: Excellent tooling and ORM support (e.g., Prisma) in the Node.js/TypeScript ecosystem.

### Installation & Setup

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **Install Dependencies**
    _(Using PNPM is recommended if you have a monorepo structure)_

    ```bash
    # Using make (if defined in Makefile)
    make i
    # Or manually with pnpm
    pnpm install
    ```

3.  **Configure Environment Variables**

    - Copy the example environment files:
      ```bash
      # Adjust paths based on your project structure (e.g., if using apps/*)
      cp .env.example .env
      # If using separate apps in a monorepo:
      # cp apps/merkle-pay/.env.example apps/merkle-pay/.env
      # cp apps/merkle-dashboard/.env.example apps/merkle-dashboard/.env
      ```
    - **Edit `.env`** (or the specific app `.env` files) and set the following:

      ```dotenv
      # Example .env content - Adjust based on .env.example


      # env variables starting with NEXT_PUBLIC_ can be used in the client
      NEXT_PUBLIC_SOLANA_WALLETS=
      NEXT_PUBLIC_BUSINESS_NAME="Merkle Pay Demo"
      NEXT_PUBLIC_TOKEN_OPTIONS=USDT,USDC,SOL
      NEXT_PUBLIC_BLOCKCHAIN_OPTIONS=solana

      # Database Connection String
      DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

      BETTER_AUTH_SECRET=
      BETTER_AUTH_URL=

      # env variables starting with NEXT_PUBLIC_ can be used in the client
      NEXT_PUBLIC_TURNSTILE_SITE_KEY=
      TURNSTILE_SECRET_KEY=

      # Add any other required variables (API keys, JWT secrets, etc.)
      # ...
      ```

    - Ensure your PostgreSQL server is running and accessible with the credentials provided in `DATABASE_URL`.

4.  **Database Migration (if using an ORM like Prisma)**

    - _(Assuming Prisma)_ Apply the database schema:
      ```bash
      # In the package/app where Prisma schema is defined
      make prisma-fmt
      make prisma-gen
      make prisma-migrate NAME=MY_MIGRATION_NAME
      make prisma-deploy # password is yesyesyes
      ```

5.  **Run Locally**
    - **Using Docker (Recommended for easy DB setup):**
      _(Ensure you have a `docker-compose.yml` that sets up the app and a PostgreSQL container)_
      ```bash
      docker compose up --build
      ```
    - **Running Manually:**
      ```bash
      make dev
      ```

---

## Deployment

_(Add specific deployment instructions here later - e.g., Docker deployment notes, Vercel instructions, etc.)_

**Note on Vercel:** Deploying applications requiring PostgreSQL on Vercel typically involves using Vercel Postgres or connecting to external managed database providers like Neon, Supabase, Aiven, etc. Ensure your RPC Node connections are securely configured in your deployment environment variables.

---

## Contributing

PRs and Issues are warmly welcomed!

---

## License

Merkle Pay is licensed under the [MIT License](LICENSE).
