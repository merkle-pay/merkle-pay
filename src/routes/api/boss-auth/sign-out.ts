import { createFileRoute } from "@tanstack/react-router";
import {
	parseBossSessionToken,
	serializeBossSignOutCookie,
} from "#/lib/boss-auth";
import { hashSessionToken } from "#/lib/session";
import { revokeBossSession } from "#/server/boss-db";

export const Route = createFileRoute("/api/boss-auth/sign-out")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const raw = parseBossSessionToken(request.headers.get("cookie"));
				if (raw) {
					const tokenHash = await hashSessionToken(raw);
					await revokeBossSession(tokenHash);
				}
				return Response.json(
					{ code: 200, data: null, message: "Signed out" },
					{ headers: { "Set-Cookie": serializeBossSignOutCookie() } },
				);
			},
		},
	},
});
