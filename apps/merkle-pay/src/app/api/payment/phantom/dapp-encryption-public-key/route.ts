import { NextRequest, NextResponse } from "next/server";
import { generateNaclKeysBs58Encoded } from "src/utils/phantom";
import { prisma } from "src/utils/prisma";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { nanoid } from "nanoid";
export async function POST(request: NextRequest) {
  try {
    const json: unknown = await request.json();

    const schema = z.object({
      mpid: z.string(),
      orderId: z.string(),
      paymentId: z.number(),
    });

    const { mpid, orderId, paymentId } = schema.parse(json);

    const { publicKey, privateKey } = generateNaclKeysBs58Encoded();
    const requestId = nanoid();

    await prisma.phantomDeepLink.create({
      data: {
        publicKey,
        privateKey,
        mpid,
        orderId,
        paymentId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        requestId,
      },
    });
    return NextResponse.json({ dAppPublicKey: publicKey, requestId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: fromZodError(error).message });
    }
    return NextResponse.json({
      error: `Internal server error: ${(error as Error).message}`,
    });
  }
}
