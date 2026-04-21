import bs58 from "bs58";

// Solana "reference" public key used to tag an otherwise-normal transfer so
// we can find it on-chain without a private key. 32 random bytes, base58-encoded.
// No keypair is needed — this key never signs anything.
export function generateReferencePublicKey(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	return bs58.encode(bytes);
}
