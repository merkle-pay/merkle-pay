import { execute, queryOne } from "#/lib/db";
import type { Chain } from "#/types/chain";

export type OrderStatus =
	| "PENDING"
	| "PROCESSED"
	| "CONFIRMED"
	| "FINALIZED"
	| "EXPIRED"
	| "FAILED"
	| "CANCELLED"
	| "REFUNDED";

export const SETTLED_STATUSES: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
	"CONFIRMED",
	"FINALIZED",
	"EXPIRED",
	"FAILED",
	"CANCELLED",
	"REFUNDED",
]);

export interface DbOrder {
	id: string;
	business_id: string;
	customer_id: string | null;
	created_by_staff_id: string | null;
	mpid: string;
	reference_public_key: string;
	chain: Chain;
	token: string;
	amount: string; // pg returns NUMERIC as string
	memo: string | null;
	status: OrderStatus;
	tx_id: string | null;
	expires_at: Date;
	paid_at: Date | null;
	created_at: Date;
	updated_at: Date;
}

export async function insertOrder(params: {
	businessId: string;
	mpid: string;
	referencePublicKey: string;
	chain: Chain;
	token: string;
	amount: string;
	memo: string | null;
	expiresAt: Date;
}): Promise<DbOrder> {
	const row = await queryOne<DbOrder>(
		`INSERT INTO orders
		   (business_id, mpid, reference_public_key, chain, token, amount,
		    memo, expires_at)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING *`,
		[
			params.businessId,
			params.mpid,
			params.referencePublicKey,
			params.chain,
			params.token,
			params.amount,
			params.memo,
			params.expiresAt,
		],
	);
	if (!row) throw new Error("insertOrder: insert failed");
	return row;
}

export async function getOrderByMpid(mpid: string): Promise<DbOrder | null> {
	return queryOne<DbOrder>(
		`SELECT * FROM orders WHERE mpid = $1 LIMIT 1`,
		[mpid],
	);
}

export async function markOrderStatus(params: {
	mpid: string;
	status: OrderStatus;
	txId?: string | null;
	paidAt?: Date | null;
}): Promise<number> {
	return execute(
		`UPDATE orders
		 SET status = $2,
		     tx_id = COALESCE($3, tx_id),
		     paid_at = COALESCE($4, paid_at),
		     updated_at = NOW()
		 WHERE mpid = $1
		   AND status NOT IN ('CONFIRMED','FINALIZED','EXPIRED','FAILED','CANCELLED','REFUNDED')`,
		[params.mpid, params.status, params.txId ?? null, params.paidAt ?? null],
	);
}
