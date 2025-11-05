// Legacy Prisma compatibility layer - SERVER ONLY
// This provides the same API as Prisma for backward compatibility

import { query, queryOne } from './db';

export const prisma = {
  payment: {
    findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      const key = Object.keys(where)[0];
      const value = where[key];
      return queryOne(`SELECT * FROM "Payment" WHERE "${key}" = $1`, [value]);
    },
    findUnique: async ({ where }: { where: Record<string, unknown> }) => {
      const key = Object.keys(where)[0];
      const value = where[key];
      return queryOne(`SELECT * FROM "Payment" WHERE "${key}" = $1`, [value]);
    },
    findMany: async ({ skip, take, orderBy }: { skip?: number; take?: number; orderBy?: Record<string, string> } = {}) => {
      let sql = 'SELECT * FROM "Payment"';
      const params: unknown[] = [];

      if (orderBy) {
        const key = Object.keys(orderBy)[0];
        const direction = orderBy[key];
        sql += ` ORDER BY "${key}" ${direction.toUpperCase()}`;
      }

      if (take !== undefined) {
        params.push(take);
        sql += ` LIMIT $${params.length}`;
      }

      if (skip !== undefined) {
        params.push(skip);
        sql += ` OFFSET $${params.length}`;
      }

      return query(sql, params);
    },
    count: async () => {
      const result = await queryOne<{ count: string }>('SELECT COUNT(*) as count FROM "Payment"');
      return result ? parseInt(result.count) : 0;
    },
    update: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const whereKey = Object.keys(where)[0];
      const whereValue = where[whereKey];
      const dataKeys = Object.keys(data);
      const setClause = dataKeys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
      const values = [whereValue, ...dataKeys.map(k => data[k])];

      return queryOne(
        `UPDATE "Payment" SET ${setClause}, "updatedAt" = CURRENT_TIMESTAMP WHERE "${whereKey}" = $1 RETURNING *`,
        values
      );
    },
  },
  phantomDeepLink: {
    findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      const key = Object.keys(where)[0];
      const value = where[key];
      return queryOne(`SELECT * FROM "PhantomDeepLink" WHERE "${key}" = $1`, [value]);
    },
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const keys = Object.keys(data);
      const values = keys.map(k => data[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.map(k => `"${k}"`).join(', ');

      return queryOne(
        `INSERT INTO "PhantomDeepLink" (${columns}, "createdAt", "updatedAt")
         VALUES (${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
        values
      );
    },
    update: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const whereKey = Object.keys(where)[0];
      const whereValue = where[whereKey];
      const dataKeys = Object.keys(data);
      const setClause = dataKeys.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
      const values = [whereValue, ...dataKeys.map(k => data[k])];

      return queryOne(
        `UPDATE "PhantomDeepLink" SET ${setClause}, "updatedAt" = CURRENT_TIMESTAMP WHERE "${whereKey}" = $1 RETURNING *`,
        values
      );
    },
  },
  business: {
    findMany: async () => {
      return query('SELECT * FROM "Business"');
    },
    create: async ({ data }: { data: Record<string, unknown> }) => {
      const keys = Object.keys(data);
      const values = keys.map(k => data[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const columns = keys.map(k => `"${k}"`).join(', ');

      return queryOne(
        `INSERT INTO "Business" (${columns}, "createdAt", "updatedAt")
         VALUES (${placeholders}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
        values
      );
    },
  },
  boss: {
    findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      const keys = Object.keys(where);
      if (keys.length === 0) return null;

      const whereClauses = keys.map((k, i) => `"${k}" = $${i + 1}`);
      const values = keys.map(k => where[k]);

      return queryOne(
        `SELECT * FROM "Boss" WHERE ${whereClauses.join(' AND ')}`,
        values
      );
    },
  },
};
