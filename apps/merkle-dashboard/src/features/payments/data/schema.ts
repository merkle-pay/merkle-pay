import { z } from 'zod'

export const paymentSchema = z.object({
  id: z.number(),
  amount: z.number(),
  token: z.string(),
  blockchain: z.string(),
  orderId: z.string(),
  status: z.string(),
  business_name: z.string(),
  recipient_address: z.string(),
  payer_address: z.string().nullable(),
  referencePublicKey: z.string(),
  mpid: z.string(),
  raw: z.any(),
  createdAt: z.string(),
})

export type Payment = z.infer<typeof paymentSchema>
