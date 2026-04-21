// Solana mainnet SPL token mint addresses for tokens we support.
// SOL is native and has no mint.
export const SOLANA_TOKEN_MINTS: Record<string, string> = {
	USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
	USDT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
};

export function isNativeSol(token: string): boolean {
	return token.toUpperCase() === "SOL";
}
