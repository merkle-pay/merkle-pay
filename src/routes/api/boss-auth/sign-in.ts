import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
	BOSS_SESSION_MAX_AGE_SECONDS,
	serializeBossSessionCookie,
} from "#/lib/boss-auth";
import { verifyPassword } from "#/lib/password";
import { generateSessionToken, hashSessionToken } from "#/lib/session";
import { getBossByEmail, insertBossSession } from "#/server/boss-db";

const bodySchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export const Route = createFileRoute("/api/boss-auth/sign-in")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				let parsed: z.infer<typeof bodySchema>;
				try {
					parsed = bodySchema.parse(await request.json());
				} catch {
					return Response.json(
						{ code: 400, data: null, message: "Invalid request body" },
						{ status: 400 },
					);
				}

				const boss = await getBossByEmail(parsed.email);
				const ok = boss
					? await verifyPassword(parsed.password, boss.password_hash)
					: false;

				if (!boss || !ok) {
					return Response.json(
						{ code: 401, data: null, message: "Invalid credentials" },
						{ status: 401 },
					);
				}

				const raw = generateSessionToken();
				const tokenHash = await hashSessionToken(raw);
				const expiresAt = new Date(
					Date.now() + BOSS_SESSION_MAX_AGE_SECONDS * 1000,
				);

				await insertBossSession({
					bossId: boss.id,
					tokenHash,
					expiresAt,
					userAgent: request.headers.get("user-agent"),
					ipAddress:
						request.headers.get("cf-connecting-ip") ??
						request.headers.get("x-forwarded-for"),
				});

				return Response.json(
					{
						code: 200,
						data: { id: boss.id, email: boss.email, name: boss.name },
						message: "Signed in",
					},
					{
						headers: {
							"Set-Cookie": serializeBossSessionCookie(
								raw,
								BOSS_SESSION_MAX_AGE_SECONDS,
							),
						},
					},
				);
			},
		},
	},
});
