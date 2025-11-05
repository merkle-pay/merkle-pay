"use server";

import { Database } from "./database";
import { Payment, PaymentStatus } from "./schemas";

const db = Database.getInstance();

export const findByMpid = async (mpid: string): Promise<Payment | null> => {
  const result = await db.query<Payment>({
    text: `
      SELECT * FROM payment WHERE mpid = $1
    `,
    params: [mpid],
  });

  if (result.error || !result.data) {
    return null;
  }

  return result.data[0] || null;
};

export const updateStatus = async (
  mpid: string,
  status: PaymentStatus
): Promise<Payment | null> => {
  const result = await db.query<Payment>({
    text: `
      UPDATE payment
      SET status = $1, updatedAt = CURRENT_TIMESTAMP
      WHERE mpid = $2
      RETURNING *
    `,
    params: [status, mpid],
  });

  if (result.error || !result.data) {
    return null;
  }

  return result.data[0] || null;
};

export const findPayments = async (params: {
  page?: number;
  pageSize?: number;
}): Promise<Payment[]> => {
  const { page = 1, pageSize = 20 } = params || {};
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const result = await db.query<Payment>({
    text: `
      SELECT * FROM payment
      ORDER BY createdAt DESC
      LIMIT $1 OFFSET $2
    `,
    params: [limit, offset],
  });

  if (result.error || !result.data) {
    return [];
  }

  return result.data;
};

export const findPaymentsByClientId = async (
  clientId: string
): Promise<Payment[]> => {
  const result = await db.query<Payment>({
    text: `
      SELECT * FROM payment WHERE clientId = $1
    `,
    params: [clientId],
  });

  if (result.error || !result.data) {
    return [];
  }

  return result.data;
};
