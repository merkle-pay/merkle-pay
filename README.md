# Merkle Pay

**Accept payments in stable coins on Solana with ease—built for creators and businesses.**

- Merkle Pay is a web platform that lets creators and small business owners set up a payment page in minutes to receive stable coins such as USDT and USDC on Solana.
- With lightning-fast transactions (~400ms), low fees (~$0.01), and a smooth experience (button for mobile, QR for desktop), it’s designed to simplify crypto payments.
- Merkle Pay is fully open sourced under the MIT license

---

## Features (v1)

- **Quick Setup**:
  - Enter your Solana address and business name—get a payment page instantly.
- **Smart Delivery**:
  - Mobile (iPhone/Android): Click a button to pay via `Phantom`.
  - Desktop: Scan a QR code with your `Phantom` wallet.
- **Order Tracking**:
  - Unique `orderId` and memo (`Merkle Pay: <orderId>`)—no payment mix-ups.
- **Status Check**:
  - Buyers verify payments with a secure token.
- **Solana-Powered**:
  - Fast, cheap USDT payments—buyer covers ~$0.01 SOL fee.
- **Open-Source**:
  - Self-host with Dockern or self-deploy to `Vercel`

---

## Getting Started

### Prerequisites

- **Node.js**: v22+
- **PNPM**: v10
- **Docker**: For containerized deployment (optional).
- **Solana Wallet**: Phantom or Solflare with USDT (devnet for testing).
- **MySQL**: Local or hosted DB.

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/yourusername/merkle-pay.git
   cd merkle-pay
   ```
2. **Install Dependencies**

   ```bash
   make i
   ```

3. **Config environment**

- for merkle-pay

  ```bash
  touch apps/merkle-pay/.env

  NEXT_PUBLIC_SOLANA=address1,address2
  NEXT_PUBLIC_APP_ID="Merkle Pay Demo"
  NEXT_PUBLIC_TOKEN_OPTIONS=USDC,USDT
  ```

- for merkle-dashboard

  ```bash
  touch apps/merkle-dashbard/.env


  NEXT_PUBLIC_SOLANA=address1,address2
  NEXT_PUBLIC_APP_ID="Merkle Pay Demo"
  NEXT_PUBLIC_TOKEN_OPTIONS=USDC,USDT
  ```

4. **Run it locally**

   ```bash
   make dev
   ```
