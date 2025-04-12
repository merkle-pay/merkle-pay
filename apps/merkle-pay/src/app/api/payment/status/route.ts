import { NextRequest, NextResponse } from "next/server";
import { getPaymentByMpid } from "src/services/payment";
import { PaymentStatus, PaymentTable } from "src/utils/prisma";

import {
  Connection,
  PublicKey,
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
  clusterApiUrl,
} from "@solana/web3.js";

import {
  REQUIRED_CONFIRMATION_LEVEL,
  SETTLED_TX_STATUSES,
} from "src/utils/solana";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mpid = searchParams.get("mpid");

  if (!mpid) {
    return NextResponse.json({
      code: 400,
      data: null,
      message: "mpid is required",
    });
  }

  const payment: PaymentTable | null = await getPaymentByMpid(mpid);

  if (!payment) {
    return NextResponse.json({
      code: 404,
      data: null,
      message: "payment not found",
    });
  }

  if (SETTLED_TX_STATUSES.has(payment.status)) {
    return NextResponse.json({
      code: 200,
      data: { status: payment.status },
      message: `Payment is ${payment.status}`,
    });
  }

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  const referencePublicKey = new PublicKey(payment.referencePublicKey);

  let signatures: ConfirmedSignatureInfo[] = [];
  try {
    signatures = await connection.getSignaturesForAddress(
      referencePublicKey,
      { limit: 1 },
      REQUIRED_CONFIRMATION_LEVEL
    );
  } catch (error) {
    console.error("Error fetching signatures:", error);
    return NextResponse.json({
      code: 500,
      data: null,
      message: "Failed to query transaction signatures",
    });
  }

  if (signatures.length === 0) {
    return NextResponse.json({
      code: 200,
      data: {
        status: PaymentStatus.PENDING,
      },
      message: `Transaction reference found, but not yet reached status: ${REQUIRED_CONFIRMATION_LEVEL}`,
    });
  }

  const signatureInfo = signatures[0];

  let tx: ParsedTransactionWithMeta | null = null;

  try {
    tx = await connection.getParsedTransaction(signatureInfo.signature, {
      commitment: REQUIRED_CONFIRMATION_LEVEL,
      maxSupportedTransactionVersion: 0,
    });
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    return NextResponse.json({
      code: 500,
      data: null,
      message: "Failed to query transaction details",
    });
  }

  if (!tx) {
    return NextResponse.json({
      code: 400,
      data: {
        status: PaymentStatus.PENDING,
      },
      message:
        "Transaction data missing or not found at desired confirmation level",
    });
  }

  if (tx.meta?.err) {
    return NextResponse.json({
      code: 400,
      data: {
        status: PaymentStatus.FAILED,
      },
      message: `Transaction failed on-chain: ${JSON.stringify(tx.meta.err)}`,
    });
  }

  return NextResponse.json({
    code: 200,
    data: {
      status: PaymentStatus.CONFIRMED,
    },
    message: `Payment confirmed at level: ${REQUIRED_CONFIRMATION_LEVEL}`,
  });
}
