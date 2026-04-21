import { queryOne } from "#/lib/db";
import type { Chain, ChainConfig, ChainConfigEntry } from "#/types/chain";

export interface DbBusiness {
	id: string;
	name: string;
	slug: string;
	chain_config: ChainConfig;
	created_at: Date;
	updated_at: Date;
}

export async function getBusinessBySlug(
	slug: string,
): Promise<DbBusiness | null> {
	return queryOne<DbBusiness>(
		`SELECT id, name, slug, chain_config, created_at, updated_at
		 FROM businesses WHERE LOWER(slug) = LOWER($1) LIMIT 1`,
		[slug],
	);
}

export async function getBusinessById(
	id: string,
): Promise<DbBusiness | null> {
	return queryOne<DbBusiness>(
		`SELECT id, name, slug, chain_config, created_at, updated_at
		 FROM businesses WHERE id = $1 LIMIT 1`,
		[id],
	);
}

export function getChainEntry(
	business: DbBusiness,
	chain: Chain,
): ChainConfigEntry | null {
	return business.chain_config[chain] ?? null;
}
