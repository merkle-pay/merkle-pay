import { ZodError } from 'zod'
import { fromZodError } from 'zod-validation-error'

export const logger = (error: unknown) => {
  if (import.meta.env.DEV) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error)
      // eslint-disable-next-line no-console
      console.log(validationError.message)
    } else {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }
}
