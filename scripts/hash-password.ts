import { webcrypto } from "node:crypto";

const password = process.argv[2];
if (!password) {
	console.error("Usage: tsx scripts/hash-password.ts <password>");
	process.exit(1);
}

const PBKDF2_ITERATIONS = 100_000;
const SALT_LENGTH = 16;
const HASH_LENGTH = 32;

const salt = webcrypto.getRandomValues(new Uint8Array(SALT_LENGTH));
const key = await webcrypto.subtle.importKey(
	"raw",
	new TextEncoder().encode(password),
	"PBKDF2",
	false,
	["deriveBits"],
);
const hash = await webcrypto.subtle.deriveBits(
	{ name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
	key,
	HASH_LENGTH * 8,
);

const toHex = (u8: Uint8Array) =>
	Array.from(u8)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

console.log(`${toHex(salt)}:${toHex(new Uint8Array(hash))}`);
