# Merkle Pay

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

<a href="README.md" style="text-decoration: none;"><span style="font-size: larger;">English</span></a> <span> • </span>
<a href="README_zh-CN.md" style="text-decoration: none;"><span style="font-size: larger;">简体中文</span></a> <span> • </span>
<a href="README_zh-TW.md" style="text-decoration: none;"><span style="font-size: larger;">繁體中文</span></a> <span> • </span>
<a href="README_jp.md" style="text-decoration: none;"><span style="font-size: larger;">日本語</span></a><span> • </span>
<a href="README_kr.md" style="text-decoration: none;"><span style="font-size: larger;">한국어</span></a>

---

**Accept stablecoin payments on Solana, Base, SUI, TRON, Polygon, Arbitrum, Optimism and more with ease—built for creators, indie hackers, and small businesses.**

Merkle Pay is a non-custodial web platform enabling users to quickly set up payment pages for receiving stablecoins like USDT and USDC directly to their own wallets on **multiple blockchains**.

Leveraging native blockchain payment standards (like Solana Pay and EIP-681), it offers fast transactions, extremely low network fees (on supported chains), and a smooth user experience.

Merkle Pay is fully open-source under the [MIT license](LICENSE).

---

## Supported Blockchains & Status

Merkle Pay aims to provide a seamless payment experience across high-throughput, low-fee networks:

- ✅ **Solana** (Live & Fully Supported)
  - Native SOL, USDC, USDT payments confirmed.
- ⏳ **Base** (Next Focus - In Progress)
  - EVM integration using EIP-681 is actively being developed.
- ⏳ **Polygon PoS** (Planned)
- ⏳ **Arbitrum One** (Planned)
- ⏳ **Optimism** (Planned)
- ◻️ **Sui** (Future Consideration)
- ◻️ **TRON** (Future Consideration)

_(Support for additional chains may be added based on development progress and community demand.)_

---

## Supported Wallets & Interaction Methods

Wallet compatibility ensures a smooth payment experience for your customers.

**Solana:**

- ✅ **Phantom**: Supports all interaction methods:
  - QR Code Scanning (via Solana Pay)
  - Desktop Browser Extension Invocation
  - Mobile Deeplinking / Universal Links
- ✅ **Solflare**: Supports all interaction methods:
  - QR Code Scanning (via Solana Pay)
  - Desktop Browser Extension Invocation
  - Mobile Deeplinking / Universal Links
- **Other Solana Wallets**: Wallets implementing the Solana Pay standard _should_ be compatible with QR code scanning. Deeplinking and extension support may vary.

**EVM (Base, Polygon, Arbitrum, Optimism - _Coming Soon_):**

- Target wallets include **MetaMask**, **Rabby**, **Phantom (EVM)**, **Coinbase Wallet**, and others supporting the **EIP-681** payment request standard via QR code scanning or link handling.

---

## Features

- **Multi-Chain Ready**: Fully functional on Solana; EVM support (Base first, then others) in active development.
- **Instant Setup**: Enter your wallet address(es) and business name—get a payment page ready in minutes.
- **Non-Custodial**: Payments go directly from the payer's wallet to your specified wallet address. Merkle Pay never holds your funds.
- **Comprehensive Solana Payments**:
  - Scan QR Code (Solana Pay Protocol) via Phantom and Solflare
  - Phantom wallet chrome extension connect and send transaction
  - Phantom app deeplink connect and send transaction
- **EIP-681 Standard for EVM**: Generates standard `ethereum:` payment URIs/QR codes for EVM chains (Base, Polygon, etc.) compatible with major wallets.
- **Robust Off-Chain Tracking**: Links merchant `orderId`s to confirmed blockchain transactions (`txHash`) via backend monitoring and stores the relationship securely in your PostgreSQL database.
- **Unique Payment Disambiguation**: Uses amount randomization (the "cents trick") for EVM payments and leverages Solana Pay's reference mechanism to reliably distinguish between potentially simultaneous payments, ensuring accurate mapping in the database.
- **Stablecoin Focus**: Designed primarily for USDT, USDC, and native chain assets (like SOL) on supported chains.
- **Open-Source & Self-Hostable**: Deploy using Docker or manually deploy to platforms like Vercel.
- **Basic UI**: Utilizes Arco Design for a clean, functional interface. (Focus is currently on functionality, UI contributions welcome!)

---

## Getting Started

### Prerequisites for LOCAL DEVELOPMENT

- **Node.js**: v22+ recommended
- **PNPM**: v10.6.4
- **PostgreSQL**: A running instance (local or hosted)
- **Web3 Wallet**:
  - **Solana:** Phantom, Solflare, etc. (ensure you have devnet SOL/tokens for testing)
  - **EVM (Base/Polygon/etc.):** MetaMask or similar (once EVM support is added)
  - **Sui:** (once Sui support is added)

### Why PostgreSQL?

- **Data Integrity**: Relational structure and constraints (like Foreign Keys) ensure data consistency, crucial for linking payments to merchants accurately across different chains.
- **Transactional Reliability (ACID)**: Guarantees that operations (like updating payment status) complete fully or not at all, vital for financial applications.
- **Structured Querying**: SQL provides powerful and standard ways to query and analyze payment data as the platform grows.
- **Mature Ecosystem**: Excellent tooling and ORM support (e.g., Prisma) in the Node.js/TypeScript ecosystem.

### Installation & Setup for <u>LOCAL DEVELOPMENT</u>

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/merkle-pay/merkle-pay.git
    cd merkle-pay
    ```

2.  **Install Dependencies**
    _(Recommended to use make)_

    ```bash
     # Using make (recommended)
    make i
     # Or manually with pnpm
    pnpm install
    ```

3.  **Configure Environment Variables**

    ```bash
     # you need two .env files for local development

     # step 1: backend config
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env

     # step 2: frontend dev flag
    cp apps/merkle-dashboard/.env.production.example apps/merkle-dashboard/.env.production
    ```

4.  **Database Setup & Migration**

    ```bash
     # Navigate to the merkle-pay app directory first
    cd apps/merkle-pay
     # Generate Prisma client
    make prisma-gen
     # Apply migration to database (password is 'yesyesyes')
    make prisma-deploy
    ```

5.  **Run Locally**
    ```bash
     # In root directory
    make dev
    ```

---

### Deployment for <u>PRODUCTION</u>

0.  **Install docker**

    ```bash
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    ```

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/merkle-pay/merkle-pay.git
    cd merkle-pay
    ```

2.  **Configure Environment Variables**

    ```bash
     # edit .env file and add your production env vars
    cp apps/merkle-pay/.env.example apps/merkle-pay/.env
    ```

3.  **Build & Run with Docker Compose**

    ```bash
     # Build images and start containers in detached mode
    make d-up
     # To stop: make d-stop
     # To view logs: make d-logs
    ```

4.  **Recreate everything after git pull**

    ```bash
     # when you pull the lastest version of merkle-pay project
     # you need to re-create everything

     # step1. remove everything, and get back to a completely clean slate
    make d-clean
     # step2. re-create everything, starting fresh
    make d-up
    ```

---

## Contributing

- PRs and Issues are warmly welcomed!
- Focus areas include EVM chain integrations, UI improvements, and additional wallet support.

---

## License

Merkle Pay is licensed under the [MIT License](LICENSE).
