import { PaymentFormData } from "src/types/payment";
import { Payment, PaymentStatus } from "../types/database";
import { query, queryOne } from "../lib/db";
import { logger } from "../utils/logger";

export const createPaymentTableRecord = async ({
  paymentFormData,
  referencePublicKey,
  mpid,
}: {
  paymentFormData: PaymentFormData;
  referencePublicKey: string;
  mpid: string;
}): Promise<Payment> => {
  const rows = await query<Payment>(
    `INSERT INTO "Payment" (
      amount, token, blockchain, "orderId", status, "referencePublicKey",
      recipient_address, mpid, raw, business_name, "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    RETURNING *`,
    [
      paymentFormData.amount,
      paymentFormData.token,
      paymentFormData.blockchain,
      paymentFormData.orderId,
      PaymentStatus.PENDING,
      referencePublicKey,
      paymentFormData.recipient_address,
      mpid,
      JSON.stringify(paymentFormData),
      paymentFormData.businessName,
    ]
  );
  return rows[0];
};

export const getPaymentByMpid = async (mpid: string): Promise<Payment | null> => {
  return queryOne<Payment>(
    `SELECT * FROM "Payment" WHERE mpid = $1`,
    [mpid]
  );
};

export const updatePaymentTxId = async (
  mpid: string,
  txId: string
): Promise<Payment | null> => {
  return queryOne<Payment>(
    `UPDATE "Payment" SET "txId" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE mpid = $2 RETURNING *`,
    [txId, mpid]
  );
};

export const updatePaymentStatus = async ({
  mpid,
  status,
}: {
  mpid: string;
  status: PaymentStatus;
}): Promise<Payment | null> => {
  try {
    return queryOne<Payment>(
      `UPDATE "Payment" SET status = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE mpid = $2 RETURNING *`,
      [status, mpid]
    );
  } catch (error) {
    logger.error({ err: error }, "Error updating payment status");
    return null;
  }
};

export const updatePaymentTxIdIfNotSet = async ({
  mpid,
  txId,
}: {
  mpid: string;
  txId: string;
}): Promise<Payment | null> => {
  try {
    const result = await queryOne<Payment>(
      `UPDATE "Payment" SET "txId" = $1, "updatedAt" = CURRENT_TIMESTAMP
       WHERE mpid = $2 AND ("txId" IS NULL OR "txId" = '')
       RETURNING *`,
      [txId, mpid]
    );

    if (!result) {
      logger.info({ mpid }, "Payment not found or txId already set");
      return null;
    }

    return result;
  } catch (error) {
    logger.error({ err: error }, "Error updating payment txId");
    return null;
  }
};
