import { z } from 'zod'
import { logger } from '@/utils/logger'
import { businessSchema } from '@/features/businesses/data/schema'
import { mpFetch } from './mp_fetch'

export const fetchBusinesses = async () => {
  try {
    const json = await mpFetch(`/api/dashboard/businesses`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const responseSchema = z.object({
      code: z.number(),
      data: z
        .object({
          businesses: z.array(businessSchema),
        })
        .or(z.null()),
      message: z.string(),
    })

    const parsedJson = responseSchema.parse(json)

    return (
      parsedJson.data ?? {
        businesses: null,
      }
    )
  } catch (error) {
    logger(`Error fetching businesses: ${error}`)
  }

  return {
    businesses: null,
  }
}
