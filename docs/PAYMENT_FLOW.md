# Payment Flow Architecture

This document describes the complete payment flow for different blockchain integrations in Merkle Pay.

## Solana Payment Flow

### Complete Flow Diagram

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

### Key Transaction Parameters

| Parameter          | Description                  | Example                        |
| ------------------ | ---------------------------- | ------------------------------ |
| **amount**         | Numeric value                | `100.50`                       |
| **token**          | Token symbol                 | `USDC`, `USDT`, `SOL`          |
| **decimal**        | Token decimal places         | USDC/USDT: 6, SOL: 9           |
| **lamports/units** | Smallest unit value          | amount × 10^decimals           |
| **reference**      | Ephemeral keypair public key | Solana Pay standard            |
| **memo**           | On-chain memo text           | "Business Name -- OrderID"     |
| **commitment**     | Confirmation level           | `"confirmed"` or `"finalized"` |

### Token Configuration

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

### Token Mint Addresses (Solana Mainnet)

- USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` (6 decimals)
- USDT: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB` (6 decimals)
- SOL: `So11111111111111111111111111111111111111112` (9 decimals)

### Timing Constants

```typescript
MERKLE_PAY_EXPIRE_TIME = 2 hours       // Payment link validity
POLLING_INTERVAL_MS = 2 seconds        // Status check frequency
MONITORING_TIMEOUT_MS = 90 seconds     // Maximum monitoring duration
REQUIRED_CONFIRMATION_LEVEL = "confirmed"
```

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

## EVM (Ethereum/Base) Payment Flow

**Status:** In progress, partially implemented

### Standards

- **EIP-681:** Ethereum Payment Request Standard
- **Format:** `ethereum:<recipient>?value=<wei>&data=<hex>`
- **QR Code:** Encoded URI

### Future Implementation Pattern

```
1. Build EIP-681 URI from payment parameters
2. Add "cents trick" randomization to amount for disambiguation
3. Generate QR code with ethereum: protocol
4. Client (MetaMask, Rabby, etc.) scans and processes
5. Monitor transaction via eth_getTransactionReceipt
```

## Implementation Files

### Solana

- Transaction builders: `apps/merkle-pay/src/utils/solana.ts`
- Payment components: `apps/merkle-pay/src/components/pay-solana/`
- API routes: `apps/merkle-pay/src/app/api/payment/init-solana/`
- Status tracking: `apps/merkle-pay/src/app/api/payment/status/`

### EVM

- Transaction builders: `apps/merkle-pay/src/utils/ethereum.ts`
- Payment components: `apps/merkle-pay/src/components/pay-ethereum/`
- API routes: (In development)

## Related Documentation

- [Database Schema](./DATABASE.md) - Payment model and status tracking
- [API Reference](./API.md) - Payment API endpoints
- [Security](./SECURITY.md) - Transaction verification and security
