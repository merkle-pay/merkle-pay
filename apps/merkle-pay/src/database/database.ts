import { Pool, PoolClient } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = pool;
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async query<T = any>({
    text,
    params,
  }: {
    text: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params?: any[];
  }): Promise<{ data: T[]; error: null } | { data: null; error: string }> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(text, params);
      return {
        data: result.rows,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknow Error",
      };
    } finally {
      client.release();
    }
  }

  // ! seems useless function
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T | undefined> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      console.log(error);
    } finally {
      client.release();
    }
  }
}
