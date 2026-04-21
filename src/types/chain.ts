export type Chain = "solana";

export interface ChainConfigEntry {
	payout: string; // merchant payout wallet (base58 pubkey for Solana)
	tokens: string[]; // supported token symbols, e.g. ["USDC","USDT","SOL"]
}

export type ChainConfig = Partial<Record<Chain, ChainConfigEntry>>;
