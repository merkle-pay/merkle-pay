// Client-side Phantom-extension pay flow. Everything @solana/* and `buffer`
// is loaded via dynamic import so it never enters the SSR/Workers bundle
// (the Solana SDKs pull in Node's Buffer which only works with a browser
// polyfill — see memory/feedback_solana_libs_server_only.md).
//
// Why the reference key shows up as a memo-instruction key: our chain
// verifier uses getSignaturesForAddress(reference_public_key) to detect
// the payment. Any tx that includes the reference as an account key —
// even non-signer, non-writable — shows up in that list. Putting it on
// the memo instruction is the simplest way to embed it.

export interface PhantomExtensionPaymentInput {
	recipientAddress: string;
	referencePublicKey: string;
	payUrl: string; // unused, reserved for future fallback
	token: string;
	amount: number;
	merchantOrderId: string;
	splMint: string | null;
}

export interface PhantomExtensionPaymentResult {
	signature: string;
}

const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

interface PhantomProvider {
	isPhantom?: boolean;
	connect: (opts?: {
		onlyIfTrusted?: boolean;
	}) => Promise<{ publicKey: { toString(): string } }>;
	signAndSendTransaction: (tx: unknown) => Promise<{ signature: string }>;
	disconnect?: () => Promise<void>;
}

export function detectPhantomExtension():
	| { isPhantom: true; provider: PhantomProvider }
	| { isPhantom: false } {
	if (typeof window === "undefined") return { isPhantom: false };
	const w = window as unknown as { phantom?: { solana?: PhantomProvider } };
	const provider = w.phantom?.solana;
	if (provider?.isPhantom) return { isPhantom: true, provider };
	return { isPhantom: false };
}

export async function payWithPhantomExtension(
	input: PhantomExtensionPaymentInput,
): Promise<PhantomExtensionPaymentResult> {
	const detected = detectPhantomExtension();
	if (!detected.isPhantom) {
		throw new Error("Phantom extension not detected");
	}

	// Load Buffer first and expose it on globalThis before importing any
	// @solana/* module — those modules reference `Buffer` as a global at
	// top level, so the polyfill must be in place before their module eval.
	const { Buffer } = await import("buffer");
	const g = globalThis as unknown as { Buffer?: unknown };
	if (!g.Buffer) g.Buffer = Buffer;

	const [web3, spl] = await Promise.all([
		import("@solana/web3.js"),
		import("@solana/spl-token"),
	]);
	const { PublicKey, Transaction, SystemProgram, TransactionInstruction } = web3;

	// Current Phantom docs recommend calling connect() with no args. Passing
	// `{onlyIfTrusted: false}` trips some extension builds with a generic
	// "Unexpected error" before the connect popup even appears.
	let publicKey: { toString(): string } | null = null;
	try {
		const resp = await detected.provider.connect();
		publicKey = resp.publicKey;
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		throw new Error(
			`Phantom connect failed (${msg}). Try: unlock Phantom; or remove localhost from Phantom → Settings → Trusted Apps; or refresh the page.`,
		);
	}
	if (!publicKey) throw new Error("Wallet connection rejected");
	const payer = new PublicKey(publicKey.toString());
	const recipient = new PublicKey(input.recipientAddress);
	const reference = new PublicKey(input.referencePublicKey);

	const instructions: InstanceType<typeof TransactionInstruction>[] = [];

	// Memo instruction. The reference key rides as an extra (non-signer,
	// non-writable) account so findReference() picks this tx up on-chain.
	instructions.push(
		new TransactionInstruction({
			keys: [
				{ pubkey: payer, isSigner: true, isWritable: true },
				{ pubkey: reference, isSigner: false, isWritable: false },
			],
			programId: new PublicKey(MEMO_PROGRAM_ID),
			data: Buffer.from(input.merchantOrderId, "utf8"),
		}),
	);

	if (input.token === "SOL") {
		const LAMPORTS_PER_SOL = 1_000_000_000;
		const lamports = Math.round(input.amount * LAMPORTS_PER_SOL);
		if (lamports <= 0) throw new Error("Invalid SOL amount");
		instructions.push(
			SystemProgram.transfer({
				fromPubkey: payer,
				toPubkey: recipient,
				lamports,
			}),
		);
	} else {
		if (!input.splMint) throw new Error(`Unknown SPL mint for ${input.token}`);
		const mint = new PublicKey(input.splMint);
		const decimals = resolveSplDecimals(input.token);
		const units = Math.round(input.amount * 10 ** decimals);
		if (units <= 0) throw new Error("Invalid SPL amount");
		const senderAta = await spl.getAssociatedTokenAddress(mint, payer);
		const recipientAta = await spl.getAssociatedTokenAddress(mint, recipient);
		instructions.push(
			spl.createTransferInstruction(
				senderAta,
				recipientAta,
				payer,
				units,
				[],
				spl.TOKEN_PROGRAM_ID,
			),
		);
	}

	const tx = new Transaction().add(...instructions);
	tx.feePayer = payer;

	// Fetch a recent blockhash from our server (which owns the Helius key).
	// Phantom does not reliably set this itself; without it Phantom shows
	// a generic "Unexpected error" when forwarding to the cluster.
	const bhRes = await fetch("/api/solana/blockhash");
	const bh = (await bhRes.json()) as {
		code: number;
		data: { blockhash: string } | null;
		message: string;
	};
	if (!bhRes.ok || bh.code !== 200 || !bh.data?.blockhash) {
		throw new Error(`Failed to fetch blockhash: ${bh.message}`);
	}
	tx.recentBlockhash = bh.data.blockhash;

	const { signature } = await detected.provider.signAndSendTransaction(tx);
	return { signature };
}

// USDC, USDT: 6 decimals. Extend here if more SPL tokens are added.
function resolveSplDecimals(token: string): number {
	switch (token.toUpperCase()) {
		case "USDC":
		case "USDT":
			return 6;
		default:
			throw new Error(`Unknown decimals for token ${token}`);
	}
}
