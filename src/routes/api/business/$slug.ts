import { createFileRoute } from "@tanstack/react-router";
import { getBusinessBySlug } from "#/server/business-db";

// Public metadata about a business — safe to expose to the pay page so the
// form can render supported tokens. Does NOT include payout wallets (those
// live only in the generated Solana Pay URL at QR render time).
export const Route = createFileRoute("/api/business/$slug")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const business = await getBusinessBySlug(params.slug);
				if (!business) {
					return Response.json(
						{ code: 404, data: null, message: "Business not found" },
						{ status: 404 },
					);
				}
				const chains = Object.entries(business.chain_config).map(
					([chain, entry]) => ({
						chain,
						tokens: entry?.tokens ?? [],
					}),
				);
				return Response.json({
					code: 200,
					data: {
						slug: business.slug,
						name: business.name,
						chains,
					},
					message: "ok",
				});
			},
		},
	},
});
