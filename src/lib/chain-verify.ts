import { findReference, FindReferenceError } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import { getSolanaConnection } from "#/lib/solana-rpc";

export interface ReferenceMatch {
	signature: string;
	commitment: "confirmed" | "finalized";
}

// Look for a transaction that references the given reference public key.
// Returns the signature when found, or null when no matching tx exists yet.
// Errors (RPC failures, timeouts) bubble up — caller decides how to handle.
export async function findOrderSignature(
	referencePublicKey: string,
): Promise<ReferenceMatch | null> {
	const connection = getSolanaConnection();
	const reference = new PublicKey(referencePublicKey);

	// First check finalized — if we have it, we can jump straight to FINALIZED.
	try {
		const sig = await findReference(connection, reference, {
			finality: "finalized",
		});
		return { signature: sig.signature, commitment: "finalized" };
	} catch (e) {
		if (!(e instanceof FindReferenceError)) throw e;
	}

	// Otherwise try confirmed.
	try {
		const sig = await findReference(connection, reference, {
			finality: "confirmed",
		});
		return { signature: sig.signature, commitment: "confirmed" };
	} catch (e) {
		if (e instanceof FindReferenceError) return null;
		throw e;
	}
}
