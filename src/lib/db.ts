import { Client } from "@neondatabase/serverless";

async function getClient(): Promise<Client> {
	const url = process.env.DATABASE_URL;
	if (!url) {
		throw new Error("DATABASE_URL is not set");
	}
	const client = new Client(url);
	await client.connect();
	return client;
}

export async function query<T>(
	sql: string,
	params: unknown[] = [],
): Promise<T[]> {
	const client = await getClient();
	try {
		const { rows } = await client.query(sql, params);
		return rows as T[];
	} finally {
		await client.end();
	}
}

export async function queryOne<T>(
	sql: string,
	params: unknown[] = [],
): Promise<T | null> {
	const rows = await query<T>(sql, params);
	return rows[0] ?? null;
}

export async function execute(
	sql: string,
	params: unknown[] = [],
): Promise<number> {
	const client = await getClient();
	try {
		const result = await client.query(sql, params);
		return result.rowCount ?? 0;
	} finally {
		await client.end();
	}
}

export interface TxClient {
	query: <T>(sql: string, params?: unknown[]) => Promise<T[]>;
	queryOne: <T>(sql: string, params?: unknown[]) => Promise<T | null>;
}

export async function withTransaction<T>(
	fn: (tx: TxClient) => Promise<T>,
): Promise<T> {
	const client = await getClient();
	try {
		await client.query("BEGIN");
		const tx: TxClient = {
			query: async <R>(sql: string, params: unknown[] = []) => {
				const { rows } = await client.query(sql, params);
				return rows as R[];
			},
			queryOne: async <R>(sql: string, params: unknown[] = []) => {
				const { rows } = await client.query(sql, params);
				return ((rows[0] as R) ?? null) as R | null;
			},
		};
		const result = await fn(tx);
		await client.query("COMMIT");
		return result;
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		await client.end();
	}
}
