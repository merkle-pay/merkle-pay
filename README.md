# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**Accept stablecoin payments on Solana, Polygon, Arbitrum, and zkSync with ease—built for creators, indie hackers, and small businesses.**

Merkle Pay is a non-custodial web platform enabling users to quickly set up payment pages for receiving stablecoins like USDT and USDC directly to their own wallets on **multiple blockchains**.

Leveraging native blockchain payment standards (like Solana Pay and EIP-681), it offers fast transactions, extremely low network fees, and a smooth user experience across all supported chains.

Merkle Pay is fully open-source under the [MIT license](LICENSE).

---

## Supported Blockchains (v1)

Merkle Pay aims to provide a seamless payment experience across high-throughput, low-fee networks:

- ✅ **Solana**
- ✅ **TRON** _(Coming Soon)_
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

### Prerequisites for LOCAL DEVELOPMENT

- **Node.js**: v22+ recommended
- **PNPM**: v10.6.4
- **PostgreSQL**: A running instance (local or hosted)
- **Web3 Wallet**:
  - **Solana:** Phantom, Solflare, etc.
  - **EVM (Polygon/Arbitrum/zkSync):** coming soon

### Why PostgreSQL?

- **Data Integrity**: Relational structure and constraints (like Foreign Keys) ensure data consistency, crucial for linking payments to merchants accurately across different chains.
- **Transactional Reliability (ACID)**: Guarantees that operations (like updating payment status) complete fully or not at all, vital for financial applications.
- **Structured Querying**: SQL provides powerful and standard ways to query and analyze payment data as the platform grows.
- **Mature Ecosystem**: Excellent tooling and ORM support (e.g., Prisma) in the Node.js/TypeScript ecosystem.

### Installation & Setup for LOCAL DEVELOPMENT

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/yourusername/merkle-pay.git
    cd merkle-pay
    ```

2.  **Install Dependencies**
    _(Using PNPM is recommended if you have a monorepo structure)_

    ```bash
    # Using make
    make i
    # Or manually with pnpm
    pnpm install
    ```

3.  **Configure Environment Variables**

    ```bash
    # you need two .env files for local development

    # no.1
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    # no.2
    touch apps/merkle-dashboard/.env.development
    // VITE_TURNSTILE_SITE_KEY=YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY
    // VITE_DEV=true
    ```

4.  **Database Migration**

    ```bash
    cd apps/merkle-pay
    make prisma-gen
    make prisma-deploy # password is yesyesyes
    ```

5.  **Run Locally**
    ```bash
    make dev
    ```

---

## Deployment for PRODUCTION

- coming soon

---

## Contributing

- PRs and Issues are warmly welcomed!

---

## License

Merkle Pay is licensed under the [MIT License](LICENSE).
