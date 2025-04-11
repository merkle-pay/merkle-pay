import type { Cluster } from "@solana/web3.js";
import { clusterApiUrl, Connection } from "@solana/web3.js";

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

// !TODO: all kinds of solana error codes should be added as well
export const SOLANA_TX_STATUS = new Set([
  "pending", // ! not official solana tx status
  "processed",
  "confirmed",
  "finalized",
]);

export const FINAL_SOLANA_TX_STATUSES = new Set(["confirmed", "finalized"]);

export const MERKLE_PAY_EXPIRE_TIME = 1000 * 60 * 60 * 24; // 1 day
