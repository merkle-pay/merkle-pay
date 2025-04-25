import { NextRequest, NextResponse } from "next/server";
import { createPayment } from "src/services/payment";
import { paymentSchema } from "src/types/payment";
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
      payment: paymentSchema,
    })
    .safeParse(json);

  if (!parsedJson.success) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: fromZodError(parsedJson.error).message,
    });
  }

  const { payment } = parsedJson.data;

  if (
    !process.env.NEXT_PUBLIC_BLOCKCHAIN_OPTIONS?.includes(payment.blockchain) ||
    !process.env.NEXT_PUBLIC_TOKEN_OPTIONS?.includes(payment.token)
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
      recipient: new PublicKey(payment.recipient_address),
      amount: new BigNumber(payment.amount),
      // Convert the reference string back to a PublicKey object for encodeURL
      reference: new PublicKey(referencePublicKey),
      label: payment.businessName,
      memo: payment.orderId,
      message: payment.message,
      splToken: new PublicKey(
        SplTokens[parsedJson.data.payment.token as keyof typeof SplTokens].mint
      ),
    });

    const createdPayment = await createPayment({
      referencePublicKey: referencePublicKeyString,
      payment: parsedJson.data.payment,
      mpid: nanoid(),
    });

    return NextResponse.json({
      code: 200,
      data: {
        urlForQrCode: url,
        referencePublicKeyString: referencePublicKeyString,
        paymentTableRecord: createdPayment,
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
