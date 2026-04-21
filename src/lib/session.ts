// Opaque session tokens stored in the `tokens` table.
//
// Flow:
//   * generate 32 random bytes -> base64url -> raw token (goes in HttpOnly cookie)
//   * SHA-256 of raw token -> token_hash (stored in DB, used for lookup)
//
// No JWT. The DB row IS the session; deletion/revocation is instant.

const TOKEN_BYTES = 32;

function bytesToBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

export function generateSessionToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(TOKEN_BYTES));
	return bytesToBase64Url(bytes);
}

export async function hashSessionToken(token: string): Promise<string> {
	const digest = await crypto.subtle.digest(
		"SHA-256",
		new TextEncoder().encode(token),
	);
	return bytesToHex(new Uint8Array(digest));
}
