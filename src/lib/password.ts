// PBKDF2-SHA256 password hashing, matching scripts/hash-password.ts.
// Hash format: `${saltHex}:${hashHex}` — 16-byte salt, 32-byte hash, 100k iters.
// Works in both Node (via globalThis.crypto) and Cloudflare Workers.

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const HASH_LENGTH = 32;

function hexToBytes(hex: string): Uint8Array {
	const out = new Uint8Array(hex.length / 2);
	for (let i = 0; i < out.length; i++) {
		out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	}
	return out;
}

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}

async function pbkdf2(
	password: string,
	salt: Uint8Array,
): Promise<Uint8Array> {
	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveBits"],
	);
	const bits = await crypto.subtle.deriveBits(
		{
			name: "PBKDF2",
			salt,
			iterations: PBKDF2_ITERATIONS,
			hash: "SHA-256",
		},
		key,
		HASH_LENGTH * 8,
	);
	return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
	const hash = await pbkdf2(password, salt);
	return `${bytesToHex(salt)}:${bytesToHex(hash)}`;
}

export async function verifyPassword(
	password: string,
	stored: string,
): Promise<boolean> {
	const [saltHex, hashHex] = stored.split(":");
	if (!saltHex || !hashHex) return false;
	const salt = hexToBytes(saltHex);
	const expected = hexToBytes(hashHex);
	const actual = await pbkdf2(password, salt);
	return timingSafeEqual(expected, actual);
}
