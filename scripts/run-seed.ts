import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const seedFile = process.argv[2];
if (!seedFile) {
	console.error("Usage: tsx scripts/run-seed.ts <seed-file.sql>");
	process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	console.error("DATABASE_URL is not set (check .env.local)");
	process.exit(1);
}

const sql = neon(databaseUrl);
const seedSql = readFileSync(seedFile, "utf-8");

// Split on `;\n`, strip comment-only lines, drop empty statements.
const statements = seedSql
	.split(/;\n/)
	.map((s) =>
		s
			.split("\n")
			.filter((line) => !line.match(/^\s*--/) && line.trim())
			.join("\n")
			.trim(),
	)
	.filter((s) => s.length > 0);

console.log(`Running ${statements.length} statement(s) from ${seedFile}...`);

let count = 0;
for (const stmt of statements) {
	await sql.query(stmt);
	count++;
}

console.log(`Done. Executed ${count} statement(s).`);
