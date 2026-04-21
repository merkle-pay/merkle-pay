import { createFileRoute } from "@tanstack/react-router";
import { findOrderSignature } from "#/lib/chain-verify";
import {
	getOrderByMpid,
	markOrderStatus,
	SETTLED_STATUSES,
} from "#/server/order-db";

// Polling endpoint. Shape: { code, data: { status, tx_id }, message }
// On each poll we:
//   1. Load the order
//   2. If already settled, return as-is
//   3. If past expires_at, mark EXPIRED
//   4. Otherwise, check the chain. If a tx referencing the order's
//      reference_public_key exists, flip PENDING -> CONFIRMED or FINALIZED.
//
// RPC errors are surfaced in the `message` field but don't change status;
// the next poll retries.
export const Route = createFileRoute("/api/order/$mpid/status")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const order = await getOrderByMpid(params.mpid);
				if (!order) {
					return Response.json(
						{ code: 404, data: null, message: "Order not found" },
						{ status: 404 },
					);
				}

				if (SETTLED_STATUSES.has(order.status)) {
					return Response.json({
						code: 200,
						data: { status: order.status, tx_id: order.tx_id },
						message: "ok",
					});
				}

				if (order.expires_at.getTime() <= Date.now()) {
					await markOrderStatus({ mpid: order.mpid, status: "EXPIRED" });
					return Response.json({
						code: 200,
						data: { status: "EXPIRED", tx_id: order.tx_id },
						message: "Order expired",
					});
				}

				let match: Awaited<ReturnType<typeof findOrderSignature>> = null;
				let rpcError: string | null = null;
				try {
					match = await findOrderSignature(order.reference_public_key);
				} catch (err) {
					rpcError = String(err);
				}

				if (match) {
					const newStatus =
						match.commitment === "finalized" ? "FINALIZED" : "CONFIRMED";
					await markOrderStatus({
						mpid: order.mpid,
						status: newStatus,
						txId: match.signature,
						paidAt: new Date(),
					});
					return Response.json({
						code: 200,
						data: { status: newStatus, tx_id: match.signature },
						message: "ok",
					});
				}

				return Response.json({
					code: 200,
					data: { status: order.status, tx_id: order.tx_id },
					message: rpcError ? `rpc: ${rpcError}` : "ok",
				});
			},
		},
	},
});
