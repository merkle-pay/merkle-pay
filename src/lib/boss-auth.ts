// Boss auth cookie helpers. Raw session tokens live only in the HttpOnly
// cookie; the DB stores the SHA-256 hash.

import { parse, serialize } from "cookie";

export const BOSS_SESSION_COOKIE = "mp_boss_session";
export const BOSS_SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export function parseBossSessionToken(
	cookieHeader: string | null | undefined,
): string | null {
	if (!cookieHeader) return null;
	const cookies = parse(cookieHeader);
	return cookies[BOSS_SESSION_COOKIE] ?? null;
}

export function serializeBossSessionCookie(token: string, maxAgeSec: number) {
	return serialize(BOSS_SESSION_COOKIE, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: maxAgeSec,
	});
}

export function serializeBossSignOutCookie() {
	return serialize(BOSS_SESSION_COOKIE, "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 0,
	});
}
