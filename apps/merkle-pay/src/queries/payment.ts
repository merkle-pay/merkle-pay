import {
  PaymentFormData,
  PaymentStatusApiResponse,
  paymentTableRecordSchema,
} from "src/types/payment";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export const createPaymentTableRecordQuery = async (
  paymentFormData: PaymentFormData,
  turnstileToken: string
) => {
  try {
    const res = await fetch("/api/payment/init", {
      method: "POST",
      body: JSON.stringify({ paymentFormData }),
      headers: {
        "Content-Type": "application/json",
        "mp-antibot-token": turnstileToken,
      },
    });

    const json: unknown = await res.json();

    const dataSchema = z.object({
      urlForSolanaPayQrCode: z.string(),
      referencePublicKeyString: z.string(),
      paymentTableRecord: paymentTableRecordSchema,
    });

    const jsonSchema = z.object({
      code: z.number(),
      data: dataSchema.or(z.null()),
      message: z.string().or(z.null()),
    });

    const jsonResult = jsonSchema.parse(json);

    if (!jsonResult.data || jsonResult.code !== 200) {
      return {
        data: null,
        error: jsonResult.message,
      };
    }

    return {
      data: jsonResult.data,
      error: null,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        data: null,
        error: fromZodError(error).message,
      };
    }
    return {
      data: null,
      error: `Error creating payment: ${(error as Error).message}`,
    };
  }
};
export const fetchPaymentStatusQuery = async (
  mpid: string | null,
  antibotToken: string
) => {
  if (!mpid) {
    return {
      data: null,
      error: "MPID missing, cannot poll status.",
    };
  }

  const response = await fetch(`/api/payment/status?mpid=${mpid}`, {
    headers: {
      "Content-Type": "application/json",
      "mp-antibot-token": antibotToken,
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: `API request failed with status ${response.status} and message ${response.statusText}`,
    };
  }
  const result: PaymentStatusApiResponse = await response.json();

  if (!result.data) {
    console.warn("API returned OK but no status data:", result);
    return {
      data: null,
      error: result.message || "Received unexpected data from API.",
    };
  }

  return {
    data: result.data,
    error: null,
  };
};
