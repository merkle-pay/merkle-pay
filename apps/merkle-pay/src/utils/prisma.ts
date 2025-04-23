import {
  PrismaClient,
  PaymentStatus,
  Payment as PaymentTableRecord,
} from "../../prisma/client";

export const prisma = new PrismaClient();
export type { PaymentTableRecord };
export { PaymentStatus };
