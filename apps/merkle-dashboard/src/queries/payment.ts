import { z } from 'zod'
import { logger } from '@/utils/logger'
import { paymentSchema } from '@/features/payments/data/schema'
import { mpFetch } from './mp_fetch'

export const fetchPayments = async ({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) => {
  try {
    const json = await mpFetch(
      `/api/dashboard/payments?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const responseSchema = z.object({
      code: z.number(),
      data: z
        .object({
          payments: z.array(paymentSchema),
          total: z.number(),
        })
        .or(z.null()),
      message: z.string(),
    })

    const parsedJson = responseSchema.parse(json)

    return (
      parsedJson.data ?? {
        payments: [],
        total: 0,
      }
    )
  } catch (error) {
    logger(`Error fetching payments: ${error}`)
  }

  return {
    payments: [],
    total: 0,
  }
}
