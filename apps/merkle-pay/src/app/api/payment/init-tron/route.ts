import { NextRequest, NextResponse } from "next/server";
import { createPaymentTableRecord } from "src/services/payment";
import { paymentFormDataSchema } from "src/types/payment";

import { nanoid } from "nanoid";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function POST(request: NextRequest) {
  const json: unknown = await request.json();
  const parsedJson = z
    .object({
      paymentFormData: paymentFormDataSchema,
    })
    .safeParse(json);

  if (!parsedJson.success) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: fromZodError(parsedJson.error).message,
    });
  }

  const { paymentFormData } = parsedJson.data;

  if (
    !process.env.NEXT_PUBLIC_BLOCKCHAIN_OPTIONS?.includes(
      paymentFormData.blockchain
    ) ||
    !process.env.NEXT_PUBLIC_TRON_TOKEN_OPTIONS?.includes(paymentFormData.token)
  ) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "Invalid blockchain",
    });
  }

  try {
    const createdPaymentTableRecord = await createPaymentTableRecord({
      paymentFormData: paymentFormData,
      mpid: nanoid(),
      referencePublicKey: nanoid(),
    });

    return NextResponse.json({
      code: 200,
      data: {
        paymentTableRecord: createdPaymentTableRecord,
      },
      message: null,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({
      code: 500,
      data: null,
      message: `Failed to create payment: ${errMsg}`,
    });
  }
}
