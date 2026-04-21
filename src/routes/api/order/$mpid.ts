import { createFileRoute } from "@tanstack/react-router";
import { buildSolanaPayUrl } from "#/lib/solana-pay";
import { getBusinessById } from "#/server/business-db";
import { getOrderByMpid } from "#/server/order-db";

// Public view of an order — enough to render the QR page. Returns the
// Solana Pay URL with the server-determined recipient baked in. Never
// exposes the raw chain_config.payout as its own field.
export const Route = createFileRoute("/api/order/$mpid")({
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
				const business = await getBusinessById(order.business_id);
				if (!business) {
					return Response.json(
						{ code: 500, data: null, message: "Order business missing" },
						{ status: 500 },
					);
				}

				let payUrl: string;
				try {
					payUrl = buildSolanaPayUrl(order, business);
				} catch (err) {
					return Response.json(
						{
							code: 500,
							data: null,
							message: `Failed to build pay URL: ${String(err)}`,
						},
						{ status: 500 },
					);
				}

				return Response.json({
					code: 200,
					data: {
						mpid: order.mpid,
						chain: order.chain,
						token: order.token,
						amount: order.amount,
						status: order.status,
						tx_id: order.tx_id,
						expires_at: order.expires_at,
						business: { name: business.name, slug: business.slug },
						pay_url: payUrl,
					},
					message: "ok",
				});
			},
		},
	},
});
