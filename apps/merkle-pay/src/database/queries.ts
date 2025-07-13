"use server";

import { Database } from "./database";
import { Payment, PaymentStatus } from "./schemas";

const db = Database.getInstance();

export const findByMpid = async (mpid: string): Promise<Payment | null> => {
  const [payment] = await db.query<Payment>(
    `
      SELECT * FROM payment WHERE mpid = $1
    `,
    [mpid]
  );

  return payment || null;
};

export const updateStatus = async (
  mpid: string,
  status: PaymentStatus
): Promise<Payment | null> => {
  const [payment] = await db.query<Payment>(
    `
      UPDATE payment 
      SET status = $1, updatedAt = CURRENT_TIMESTAMP 
      WHERE mpid = $2 
      RETURNING *
    `,
    [status, mpid]
  );

  return payment || null;
};

export const findPayments = async (params: {
  page?: number;
  pageSize?: number;
}): Promise<Payment[]> => {
  const { page = 1, pageSize = 20 } = params || {};
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  return await db.query<Payment>(
    `
      SELECT * FROM payment 
      ORDER BY createdAt DESC 
      LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );
};

export const findPaymentsByClientId = async (
  clientId: string
): Promise<Payment[]> => {
  return await db.query<Payment>(
    `
      SELECT * FROM payment WHERE clientId = $1
    `,
    [clientId]
  );
};
