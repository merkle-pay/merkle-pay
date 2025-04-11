import { z } from "zod";

// model Payment {
//     id                 String   @id @default(uuid())
//     createdAt          DateTime @default(now())
//     updatedAt          DateTime @updatedAt
//     amount             Float
//     token              String
//     blockchain         String
//     orderId            String
//     status             String
//     referencePublicKey String   @unique
//     mpid               String   @unique
//     raw                Json
//   }

export const paymentTableSchema = z.object({
  amount: z.number(),
  token: z.string(),
  blockchain: z.string(),
  orderId: z.string(),
  status: z.string(),
  referencePublicKey: z.string(),
  mpid: z.string(),
  raw: z.any(),
});

export type PaymentTable = z.infer<typeof paymentTableSchema>;
