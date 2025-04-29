import { NextRequest, NextResponse } from "next/server";
import { createPhantomPaymentUniversalLink } from "src/utils/solana";

export async function POST(request: NextRequest) {
  const { partialPaymentRecord, options } = await request.json();

  const universalLink = await createPhantomPaymentUniversalLink(
    { ...partialPaymentRecord },
    { ...options }
  );

  console.log("POST universalLink ---->", universalLink);

  return NextResponse.json({ universalLink });
}
