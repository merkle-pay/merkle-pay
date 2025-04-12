import type { Cluster } from "@solana/web3.js";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { PaymentStatus } from "./prisma";
/**
 * Establish a connection to the cluster
 */
export function establishConnection(cluster: Cluster = "devnet"): Connection {
  const endpoint = clusterApiUrl(cluster);
  const connection = new Connection(endpoint, "confirmed");
  return connection;
}

export const SplTokens = {
  USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  SOL: "So11111111111111111111111111111111111111112",
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

export const MERKLE_PAY_EXPIRE_TIME = 1000 * 60 * 60 * 2; // 2 hours

export const POLLING_INTERVAL_MS = 2000; // Check every 2 seconds
export const MONITORING_TIMEOUT_MS = 90 * 1000; // 90 seconds timeout per payment
export const REQUIRED_CONFIRMATION_LEVEL = "confirmed"; // Or 'finalized'
