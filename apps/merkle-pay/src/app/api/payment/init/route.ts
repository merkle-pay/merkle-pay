import { NextRequest, NextResponse } from "next/server";
import { createPaymentTableRecord } from "src/services/payment";
import { paymentFormDataSchema } from "src/types/payment";
import { Keypair, PublicKey } from "@solana/web3.js";
import { nanoid } from "nanoid";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { encodeURL } from "@solana/pay";
import { SplTokens } from "src/utils/solana";
import BigNumber from "bignumber.js";

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
    !process.env.NEXT_PUBLIC_SOLANA_TOKEN_OPTIONS?.includes(
      paymentFormData.token
    )
  ) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "Invalid blockchain or token",
    });
  }

  try {
    const referenceKeypair = Keypair.generate(); // Use generate() for clarity
    const referencePublicKey = referenceKeypair.publicKey;
    const referencePublicKeyString = referencePublicKey.toBase58();

    const url = encodeURL({
      recipient: new PublicKey(paymentFormData.recipient_address),
      amount: new BigNumber(paymentFormData.amount),
      // Convert the reference string back to a PublicKey object for encodeURL
      reference: new PublicKey(referencePublicKey),
      label: paymentFormData.businessName,
      memo: `${paymentFormData.businessName} -- ${paymentFormData.orderId}`,
      message: paymentFormData.message,
      splToken: new PublicKey(
        SplTokens[paymentFormData.token as keyof typeof SplTokens].mint
      ),
    });

    const createdPaymentTableRecord = await createPaymentTableRecord({
      referencePublicKey: referencePublicKeyString,
      paymentFormData: paymentFormData,
      mpid: nanoid(),
    });

    return NextResponse.json({
      code: 200,
      data: {
        urlForQrCode: url,
        referencePublicKeyString: referencePublicKeyString,
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
