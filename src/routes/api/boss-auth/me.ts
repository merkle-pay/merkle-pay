import { createFileRoute } from "@tanstack/react-router";
import { parseBossSessionToken } from "#/lib/boss-auth";
import { hashSessionToken } from "#/lib/session";
import { getActiveBossSession } from "#/server/boss-db";

export const Route = createFileRoute("/api/boss-auth/me")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const raw = parseBossSessionToken(request.headers.get("cookie"));
				if (!raw) {
					return Response.json(
						{ code: 401, data: null, message: "Not authenticated" },
						{ status: 401 },
					);
				}
				const tokenHash = await hashSessionToken(raw);
				const session = await getActiveBossSession(tokenHash);
				if (!session) {
					return Response.json(
						{ code: 401, data: null, message: "Session expired" },
						{ status: 401 },
					);
				}
				return Response.json({
					code: 200,
					data: {
						id: session.boss.id,
						email: session.boss.email,
						name: session.boss.name,
					},
					message: "ok",
				});
			},
		},
	},
});
