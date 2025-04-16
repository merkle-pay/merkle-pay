import { z } from 'zod'
import { logger } from '@/utils/logger'
import { paymentSchema } from '@/features/payments/data/schema'

const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8888' : ''

export const fetchPayments = async ({
  page,
  pageSize,
}: {
  page: number
  pageSize: number
}) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/dashboard/payments?page=${page}&pageSize=${pageSize}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      }
    )
    const json: unknown = await response.json()

    const responseSchema = z.object({
      code: z.number(),
      data: z.object({
        payments: z.array(paymentSchema),
        total: z.number(),
      }),
      message: z.string(),
    })

    const parsedJson = responseSchema.parse(json)

    return parsedJson.data
  } catch (error) {
    logger(`Error fetching payments: ${error}`)
  }

  return {
    payments: [],
    total: 0,
  }
}
