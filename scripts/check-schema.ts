import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema='public' ORDER BY table_name
`;
console.log(
	"tables:",
	tables.map((t) => t.table_name),
);

const indexes = await sql`
  SELECT indexname FROM pg_indexes
  WHERE schemaname='public' ORDER BY indexname
`;
console.log(
	"indexes:",
	indexes.map((i) => i.indexname),
);
