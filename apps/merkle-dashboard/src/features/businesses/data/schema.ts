import { z } from 'zod'

export const businessSchema = z.object({
  id: z.number(),
  business_name: z.string(),
  blockchain: z.string(),
  wallets: z.array(z.string()),
  tokens: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Business = z.infer<typeof businessSchema>
