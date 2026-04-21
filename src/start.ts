import { createMiddleware, createStart } from "@tanstack/react-start";
import { parseBossSessionToken } from "#/lib/boss-auth";
import { hashSessionToken } from "#/lib/session";
import { type DbBoss, getActiveBossSession } from "#/server/boss-db";

// Boss paths — pages under /boss and admin APIs under /api/boss/*.
// /api/boss-auth/* is public (sign-in, sign-out, me handle their own auth).
function isBossPath(pathname: string): boolean {
	return pathname === "/boss" || pathname.startsWith("/boss/");
}

function isProtectedBossApi(pathname: string): boolean {
	return (
		pathname.startsWith("/api/boss/") && !pathname.startsWith("/api/boss-auth/")
	);
}

const bossAuthMiddleware = createMiddleware().server(
	async ({ request, next }) => {
		const pathname = new URL(request.url).pathname;
		if (!isBossPath(pathname) && !isProtectedBossApi(pathname)) {
			return next({ context: { boss: null } });
		}

		const raw = parseBossSessionToken(request.headers.get("cookie"));
		let boss: DbBoss | null = null;
		if (raw) {
			const tokenHash = await hashSessionToken(raw);
			const session = await getActiveBossSession(tokenHash);
			if (session) boss = session.boss;
		}

		if (isProtectedBossApi(pathname) && !boss) {
			throw new Response(
				JSON.stringify({
					code: 401,
					data: null,
					message: "Not authenticated",
				}),
				{ status: 401, headers: { "Content-Type": "application/json" } },
			);
		}

		return next({ context: { boss } });
	},
);

export const startInstance = createStart(() => ({
	requestMiddleware: [bossAuthMiddleware],
}));
