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
} from "@solana/web3.js";

import {
  REQUIRED_CONFIRMATION_LEVEL,
  SETTLED_TX_STATUSES,
  SOLANA_RPC_ENDPOINT,
} from "src/utils/solana";

// ! bug: sometimes, txId cannot be updated to db, even if it's found on chain and the status is confirmed
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mpid = searchParams.get("mpid");

  const { payment, result } = await validatePayment(mpid);

  if (result || !payment) {
    return NextResponse.json(result);
  }

  const { result: txResult } = await findTransactionStatusOnChain({
    mpid: payment.mpid,
    referencePublicKey: payment.referencePublicKey,
    txId: payment.txId,
    status: payment.status,
  });

  if (txResult) {
    return NextResponse.json(txResult);
  }

  return NextResponse.json({
    code: 200,
    data: {
      status: PaymentStatus.CONFIRMED,
      txId: payment.txId, // Include txId in response data
    },
    message: `Payment ${payment.mpid} confirmed at level: ${REQUIRED_CONFIRMATION_LEVEL}`,
  });
}

const validatePayment = async (mpid: string | null) => {
  let result: {
    code: number;
    data: { status: PaymentStatus } | null;
    message: string;
  } | null = null;

  if (!mpid) {
    result = {
      code: 400,
      data: null,
      message: "mpid is required",
    };
    return {
      payment: null,
      result,
    };
  }

  const payment: PaymentTable | null = await getPaymentByMpid(mpid);

  if (!payment) {
    result = {
      code: 404,
      data: null,
      message: "payment not found",
    };

    return {
      payment,
      result,
    };
  }

  if (SETTLED_TX_STATUSES.has(payment.status)) {
    result = {
      code: 200,
      data: { status: payment.status },
      message: `Payment is already ${payment.status}`,
    };
  }

  return {
    payment,
    result,
  };
};

const findTransactionStatusOnChain = async ({
  mpid,
  referencePublicKey: referencePublicKeyString,
  txId: txIdFromDb,
  status: statusFromDb,
}: {
  mpid: string;
  referencePublicKey: string;
  txId: string | null;
  status: PaymentStatus;
}) => {
  let result: {
    code: number;
    data: { status: PaymentStatus } | null;
    message: string;
  } | null = null;

  const connection = new Connection(SOLANA_RPC_ENDPOINT, "confirmed");
  let tx: ParsedTransactionWithMeta | null = null;
  let signature: string | null = txIdFromDb; // Start with existing txId if available

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
  if (!tx && referencePublicKeyString) {
    console.log("Fetching signatures by reference key...");
    const referencePublicKey = new PublicKey(referencePublicKeyString);
    let signatures: ConfirmedSignatureInfo[] = [];
    try {
      signatures = await connection.getSignaturesForAddress(
        referencePublicKey,
        { limit: 1 }, // Fetch the most recent signature
        REQUIRED_CONFIRMATION_LEVEL
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result = {
        code: 500,
        data: null,
        message: `Failed to query transaction signatures by reference key: ${errorMessage}`,
      };
    }

    if (signatures.length > 0) {
      try {
        const signatureInfo = signatures[0];
        signature = signatureInfo.signature;
        tx = await connection.getParsedTransaction(signature, {
          commitment: REQUIRED_CONFIRMATION_LEVEL,
          maxSupportedTransactionVersion: 0,
        });
        // Update payment record with the txId if it wasn't set before
        if (tx && !txIdFromDb) {
          console.log(`Updating payment mpid ${mpid} with txId: ${signature}`);
          // Use signature here because tx.transaction.signatures[0] might differ if it's a different tx type
          await updatePaymentTxIdIfNotSet({
            mpid: mpid,
            txId: signature,
          });
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        // If fetching the tx details fails here, it's a server-side issue
        result = {
          code: 500,
          data: null,
          message: `Failed to query transaction details by found signature: ${errorMessage}`,
        };
      }
    } else {
      // do nothing
    }
  }

  // --- Determine final status based on transaction details (if found) ---
  if (!tx) {
    // This means either:
    // 1. No txId and no signature found by reference key
    // 2. txId existed but getParsedTransaction returned null (not confirmed/found)
    // 3. Signature found by ref key, but getParsedTransaction returned null
    result = {
      code: 200, // Still a success, just pending
      data: {
        status: PaymentStatus.PENDING,
      },
      message: `Transaction not found or not yet confirmed to level: ${REQUIRED_CONFIRMATION_LEVEL}`,
    };
  }

  if (tx?.meta?.err) {
    await updatePaymentStatus({
      mpid: mpid,
      status: PaymentStatus.FAILED,
    });
    result = {
      code: 200,
      data: {
        status: PaymentStatus.FAILED,
      },
      message: `Transaction ${mpid} failed on-chain: ${JSON.stringify(tx.meta.err)}`,
    };
  } else {
    if (statusFromDb === PaymentStatus.PENDING) {
      await updatePaymentStatus({
        mpid: mpid,
        status: PaymentStatus.CONFIRMED,
      });
    }
  }

  return {
    result,
  };
};
