import { NextRequest, NextResponse } from "next/server";
import { prisma } from "src/lib/prisma-compat";

export async function POST(request: NextRequest) {
  try {
    const { mpid, txId } = await request.json();

    const payment = await prisma.payment.findUnique({
      where: {
        mpid,
      },
    });

    if (!payment) {
      return NextResponse.json({
        code: 400,
        data: null,
        message: "Payment not found",
      });
    }

    await prisma.payment.update({
      where: {
        mpid,
      },
      data: {
        txId,
      },
    });

    return NextResponse.json({
      code: 200,
      data: {
        success: true,
      },
      message: "Transaction ID updated successfully",
    });
  } catch (error) {
    return NextResponse.json({
      code: 500,
      data: null,
      message: `Internal server error: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}
