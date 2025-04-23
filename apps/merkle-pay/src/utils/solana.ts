import type { Cluster } from "@solana/web3.js";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { PaymentStatus } from "./prisma";
import { Payment } from "src/types/payment";
import { PhantomSolanaProvider } from "src/types/global";
/**
 * Establish a connection to the cluster
 */
export function establishConnection(cluster: Cluster = "devnet"): Connection {
  const endpoint = clusterApiUrl(cluster);
  const connection = new Connection(endpoint, "confirmed");
  return connection;
}

export const SplTokens = {
  USDC: {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },
  USDT: {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
  },
};

export const NativeSolanaToken = {
  mint: "So11111111111111111111111111111111111111112",
  decimals: 9,
};

// !TODO: all kinds of solana error codes should be added later
export const SOLANA_ERROR_CODES = new Set([]);

export const SETTLED_TX_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.CONFIRMED,
  PaymentStatus.FINALIZED,
  PaymentStatus.EXPIRED,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
  PaymentStatus.CANCELLED,
]);

export const MAX_TRY_STATUS = 5;

export const MERKLE_PAY_EXPIRE_TIME = 1000 * 60 * 60 * 2; // 2 hours

export const POLLING_INTERVAL_MS = 2000; // Check every 2 seconds
export const MONITORING_TIMEOUT_MS = 90 * 1000; // 90 seconds timeout per payment
export const REQUIRED_CONFIRMATION_LEVEL = "confirmed"; // Or 'finalized'

export const getPhantomSolana = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if ("phantom" in window) {
    const solana = window.phantom?.solana;

    if (solana?.isPhantom) {
      return solana;
    }
  }

  return null;
};

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export const SOLANA_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl("mainnet-beta"); // Or "devnet", "testnet"

export const validatePhantomExtensionPayment = ({
  phantomSolana,
  payment,
}: {
  phantomSolana: PhantomSolanaProvider | null;
  payment: Payment;
}) => {
  if (!phantomSolana) {
    return {
      isValid: false,
      error: "Phantom wallet not detected.",
    };
  }
  if (!payment) {
    return {
      isValid: false,
      error: "Payment details not found.",
    };
  }

  const { recipient_address, amount, orderId, token } = payment;

  if (!recipient_address || !amount || !orderId || !token) {
    return {
      isValid: false,
      error:
        "Required payment details (recipient, amount, orderId, token) are missing.",
    };
  }
  if (orderId.length > 100) {
    return {
      isValid: false,
      error: "Order ID is too long for memo instruction (max 100 characters).",
    };
  }

  if (
    SplTokens[token as keyof typeof SplTokens] === undefined &&
    token !== "SOL"
  ) {
    return {
      isValid: false,
      error: "Invalid token.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
