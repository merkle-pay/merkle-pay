import { execute, queryOne } from "#/lib/db";

export interface DbBoss {
	id: string;
	email: string;
	password_hash: string;
	name: string | null;
	created_at: Date;
	updated_at: Date;
}

export interface DbToken {
	id: string;
	actor_type: "boss" | "staff";
	actor_id: string;
	token_hash: string;
	user_agent: string | null;
	ip_address: string | null;
	expires_at: Date;
	revoked_at: Date | null;
	created_at: Date;
}

export async function getBossByEmail(email: string): Promise<DbBoss | null> {
	return queryOne<DbBoss>(
		`SELECT id, email, password_hash, name, created_at, updated_at
		 FROM bosses WHERE LOWER(email) = LOWER($1) LIMIT 1`,
		[email],
	);
}

export async function getBossById(id: string): Promise<DbBoss | null> {
	return queryOne<DbBoss>(
		`SELECT id, email, password_hash, name, created_at, updated_at
		 FROM bosses WHERE id = $1 LIMIT 1`,
		[id],
	);
}

export async function insertBossSession(params: {
	bossId: string;
	tokenHash: string;
	expiresAt: Date;
	userAgent?: string | null;
	ipAddress?: string | null;
}): Promise<void> {
	await execute(
		`INSERT INTO tokens
		   (actor_type, actor_id, token_hash, user_agent, ip_address, expires_at)
		 VALUES ('boss', $1, $2, $3, $4, $5)`,
		[
			params.bossId,
			params.tokenHash,
			params.userAgent ?? null,
			params.ipAddress ?? null,
			params.expiresAt,
		],
	);
}

export async function getActiveBossSession(
	tokenHash: string,
): Promise<{ token: DbToken; boss: DbBoss } | null> {
	const row = await queryOne<DbToken & { boss_id: string }>(
		`SELECT id, actor_type, actor_id, token_hash, user_agent, ip_address,
		        expires_at, revoked_at, created_at, actor_id AS boss_id
		 FROM tokens
		 WHERE token_hash = $1
		   AND actor_type = 'boss'
		   AND revoked_at IS NULL
		   AND expires_at > NOW()
		 LIMIT 1`,
		[tokenHash],
	);
	if (!row) return null;
	const boss = await getBossById(row.actor_id);
	if (!boss) return null;
	return { token: row, boss };
}

export async function revokeBossSession(tokenHash: string): Promise<void> {
	await execute(
		`UPDATE tokens SET revoked_at = NOW()
		 WHERE token_hash = $1 AND actor_type = 'boss' AND revoked_at IS NULL`,
		[tokenHash],
	);
}
