import {
  PrismaClient,
  PaymentStatus,
  Payment as PaymentTable,
} from "../../prisma/client";

export const prisma = new PrismaClient();
export type { PaymentTable };
export { PaymentStatus };
