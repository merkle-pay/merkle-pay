import { createFileRoute } from "@tanstack/react-router";
import { nanoid } from "nanoid";
import { z } from "zod";
import { generateReferencePublicKey } from "#/lib/reference-key";
import { getBusinessBySlug, getChainEntry } from "#/server/business-db";
import { insertOrder } from "#/server/order-db";

// STRICT schema: no `recipient_address` / `payout` / `business_id` accepted
// from the client. The server resolves the payout wallet from the business
// row — this is the critical security invariant for the pay flow.
const bodySchema = z
	.object({
		business: z.string().min(1).max(64), // slug, not UUID
		amount: z.coerce.number().positive().finite(),
		token: z.string().min(1).max(16),
		blockchain: z.literal("solana"),
		orderId: z.string().max(128).optional(),
		payer: z.string().max(128).optional(),
		message: z.string().max(512).optional(),
		returnUrl: z.string().url().max(2048).optional(),
	})
	.strict();

const ORDER_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export const Route = createFileRoute("/api/order/init")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let parsed: z.infer<typeof bodySchema>;
				try {
					parsed = bodySchema.parse(await request.json());
				} catch (err) {
					return Response.json(
						{
							code: 400,
							data: null,
							message: `Invalid request: ${String(err)}`,
						},
						{ status: 400 },
					);
				}

				const business = await getBusinessBySlug(parsed.business);
				if (!business) {
					return Response.json(
						{ code: 404, data: null, message: "Business not found" },
						{ status: 404 },
					);
				}

				const chainEntry = getChainEntry(business, parsed.blockchain);
				if (!chainEntry) {
					return Response.json(
						{
							code: 400,
							data: null,
							message: `Business does not support chain ${parsed.blockchain}`,
						},
						{ status: 400 },
					);
				}

				if (!chainEntry.tokens.includes(parsed.token)) {
					return Response.json(
						{
							code: 400,
							data: null,
							message: `Token ${parsed.token} not supported by this business on ${parsed.blockchain}`,
						},
						{ status: 400 },
					);
				}

				const mpid = nanoid(12);
				const referencePublicKey = generateReferencePublicKey();
				const expiresAt = new Date(Date.now() + ORDER_TTL_MS);
				const memo = [parsed.orderId, parsed.message, parsed.payer]
					.filter(Boolean)
					.join(" | ") || null;

				const order = await insertOrder({
					businessId: business.id,
					mpid,
					referencePublicKey,
					chain: parsed.blockchain,
					token: parsed.token,
					amount: String(parsed.amount),
					memo,
					expiresAt,
				});

				return Response.json({
					code: 200,
					data: {
						mpid: order.mpid,
						expires_at: order.expires_at,
					},
					message: "Order created",
				});
			},
		},
	},
});
