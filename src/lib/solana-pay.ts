import { encodeURL } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import type { DbBusiness } from "#/server/business-db";
import type { DbOrder } from "#/server/order-db";
import { isNativeSol, SOLANA_TOKEN_MINTS } from "#/lib/solana-tokens";

// Build a Solana Pay URL for an order. The recipient is ALWAYS taken from
// the business row — never from order/client input. That's the security
// invariant in the pay flow.
export function buildSolanaPayUrl(
	order: DbOrder,
	business: DbBusiness,
): string {
	const payout = business.chain_config.solana?.payout;
	if (!payout) {
		throw new Error(
			`Business '${business.slug}' has no Solana payout configured`,
		);
	}

	const splMint = isNativeSol(order.token)
		? undefined
		: SOLANA_TOKEN_MINTS[order.token];
	if (!isNativeSol(order.token) && !splMint) {
		throw new Error(`Unknown SPL token symbol: ${order.token}`);
	}

	const url = encodeURL({
		recipient: new PublicKey(payout),
		amount: new BigNumber(order.amount),
		splToken: splMint ? new PublicKey(splMint) : undefined,
		reference: new PublicKey(order.reference_public_key),
		label: business.name,
		message: `Merkle Pay ${order.mpid}`,
		// On-chain memo = merchant's order reference, required on every order.
		memo: order.merchant_order_id,
	});
	return url.toString();
}
