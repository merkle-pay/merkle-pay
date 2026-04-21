import { Connection } from "@solana/web3.js";

const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";

export function getSolanaConnection(): Connection {
	const url = process.env.SOLANA_RPC_ENDPOINT ?? DEFAULT_RPC;
	return new Connection(url, "confirmed");
}
