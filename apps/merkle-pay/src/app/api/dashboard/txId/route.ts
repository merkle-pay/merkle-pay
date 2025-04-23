import { Connection, PublicKey } from "@solana/web3.js";
import { NextRequest, NextResponse } from "next/server";
import { SOLANA_RPC_ENDPOINT } from "src/utils/solana";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const referencePublicKey = searchParams.get("referencePublicKey");

  if (!referencePublicKey) {
    return NextResponse.json({ error: "referencePublicKey is required" });
  }

  const connection = new Connection(SOLANA_RPC_ENDPOINT, "confirmed");
  const signatures = await connection.getSignaturesForAddress(
    new PublicKey(referencePublicKey),
    { limit: 1 },
    "confirmed"
  );

  if (signatures.length === 0) {
    return NextResponse.json({ error: "No signatures found" });
  }

  const txId = signatures[0].signature;

  return NextResponse.json({ txId });
}
