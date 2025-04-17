import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentByMpid,
  updatePaymentStatus,
  updatePaymentTxIdIfNotSet,
} from "src/services/payment";
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

  // If already settled, return immediately
  if (SETTLED_TX_STATUSES.has(payment.status)) {
    return NextResponse.json({
      code: 200,
      data: { status: payment.status },
      message: `Payment is already ${payment.status}`,
    });
  }

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  let tx: ParsedTransactionWithMeta | null = null;
  let signature: string | null = payment.txId; // Start with existing txId if available

  // --- Try fetching by known txId first ---
  if (signature) {
    try {
      console.log(
        `Attempting to fetch transaction by known txId: ${signature}`
      );
      tx = await connection.getParsedTransaction(signature, {
        commitment: REQUIRED_CONFIRMATION_LEVEL,
        maxSupportedTransactionVersion: 0,
      });
    } catch (error) {
      // Errors fetching tx details are often transient or indicate the tx might not exist/be confirmed yet
      console.error("Error fetching transaction details by txId:", error);
      // Don't return a 500 yet, let's try the reference key method if txId fetch failed
      signature = null; // Clear signature so we attempt lookup by reference key
      tx = null; // Reset tx
    }
  }

  // --- If txId wasn't available or fetching by txId failed/returned null, try by reference key ---
  if (!tx && payment.referencePublicKey) {
    console.log("Fetching signatures by reference key...");
    const referencePublicKey = new PublicKey(payment.referencePublicKey);
    let signatures: ConfirmedSignatureInfo[] = [];
    try {
      signatures = await connection.getSignaturesForAddress(
        referencePublicKey,
        { limit: 1 }, // Fetch the most recent signature
        REQUIRED_CONFIRMATION_LEVEL
      );
    } catch (error) {
      console.error("Error fetching signatures by reference key:", error);
      return NextResponse.json({
        code: 500,
        data: null,
        message: "Failed to query transaction signatures by reference key",
      });
    }

    if (signatures.length > 0) {
      const signatureInfo = signatures[0];
      signature = signatureInfo.signature; // Found a potential signature
      console.log(`Found signature by reference key: ${signature}`);

      // Now fetch the transaction details using the found signature
      try {
        tx = await connection.getParsedTransaction(signature, {
          commitment: REQUIRED_CONFIRMATION_LEVEL,
          maxSupportedTransactionVersion: 0,
        });
        // Update payment record with the txId if it wasn't set before
        if (tx && !payment.txId) {
          console.log(`Updating payment ${mpid} with txId: ${signature}`);
          // Use signature here because tx.transaction.signatures[0] might differ if it's a different tx type
          await updatePaymentTxIdIfNotSet({
            mpid: payment.mpid,
            txId: signature,
          });
        }
      } catch (error) {
        console.error(
          "Error fetching transaction details by found signature:",
          error
        );
        // If fetching the tx details fails here, it's a server-side issue
        return NextResponse.json({
          code: 500,
          data: null,
          message: "Failed to query transaction details by found signature",
        });
      }
    } else {
      console.log("No confirmed signatures found for reference key yet.");
    }
  }

  // --- Determine final status based on transaction details (if found) ---
  if (!tx) {
    // This means either:
    // 1. No txId and no signature found by reference key
    // 2. txId existed but getParsedTransaction returned null (not confirmed/found)
    // 3. Signature found by ref key, but getParsedTransaction returned null
    console.log(
      "Transaction not found or not confirmed to required level yet."
    );
    return NextResponse.json({
      code: 200, // Still a success, just pending
      data: {
        status: PaymentStatus.PENDING,
      },
      message: `Transaction not found or not yet confirmed to level: ${REQUIRED_CONFIRMATION_LEVEL}`,
    });
  }

  // We have a transaction object (tx) at this point
  if (tx.meta?.err) {
    console.log(`Transaction ${signature} failed on-chain.`);

    await updatePaymentStatus({
      mpid: payment.mpid,
      status: PaymentStatus.FAILED,
    });
    return NextResponse.json({
      code: 200, // Request succeeded, but tx failed
      data: {
        status: PaymentStatus.FAILED,
        txId: signature, // Include txId in response data
      },
      message: `Transaction failed on-chain: ${JSON.stringify(tx.meta.err)}`,
    });
  }

  // Transaction successful and confirmed
  console.log(`Transaction ${signature} confirmed.`);
  // TODO: Optionally update payment status to CONFIRMED in DB here
  return NextResponse.json({
    code: 200,
    data: {
      status: PaymentStatus.CONFIRMED,
      txId: signature, // Include txId in response data
    },
    message: `Payment confirmed at level: ${REQUIRED_CONFIRMATION_LEVEL}`,
  });
}
