import type { Cluster } from "@solana/web3.js";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Connection,
  TransactionSignature,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BigNumber from "bignumber.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

import { PaymentStatus, PaymentTableRecord } from "./prisma";
import { Payment } from "src/types/payment";
import { PhantomSolanaProvider } from "src/types/global";

import { z } from "zod";
import { PhantomConnectCallbackData } from "./phantom";
/**
 * Establish a connection to the cluster
 */
export function establishConnection(cluster: Cluster = "devnet"): Connection {
  const endpoint = clusterApiUrl(cluster);
  const connection = new Connection(endpoint, "confirmed");
  return connection;
}

export const SplTokens = {
  USDC: {
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    decimals: 6,
  },
  USDT: {
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
  },
};

export const NativeSolanaToken = {
  mint: "So11111111111111111111111111111111111111112",
  decimals: 9,
};

// !TODO: all kinds of solana error codes should be added later
export const SOLANA_ERROR_CODES = new Set([]);

export const SETTLED_TX_STATUSES = new Set<PaymentStatus>([
  PaymentStatus.CONFIRMED,
  PaymentStatus.FINALIZED,
  PaymentStatus.EXPIRED,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED,
  PaymentStatus.CANCELLED,
]);

export const MAX_TRY_STATUS = 5;

export const MERKLE_PAY_EXPIRE_TIME = 1000 * 60 * 60 * 2; // 2 hours

export const POLLING_INTERVAL_MS = 2000; // Check every 2 seconds
export const MONITORING_TIMEOUT_MS = 90 * 1000; // 90 seconds timeout per payment
export const REQUIRED_CONFIRMATION_LEVEL = "confirmed"; // Or 'finalized'

export const getPhantomSolana = () => {
  if (typeof window === "undefined") {
    return null;
  }

  if ("phantom" in window) {
    const solana = window.phantom?.solana;

    if (solana?.isPhantom) {
      return solana;
    }
  }

  return null;
};

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

export const SOLANA_RPC_ENDPOINT =
  process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl("mainnet-beta"); // Or "devnet", "testnet"

export const validatePhantomExtensionPayment = ({
  phantomSolana,
  payment,
}: {
  phantomSolana: PhantomSolanaProvider | null;
  payment: Payment;
}) => {
  if (!phantomSolana) {
    return {
      isValid: false,
      error: "Phantom wallet not detected.",
    };
  }
  if (!payment) {
    return {
      isValid: false,
      error: "Payment details not found.",
    };
  }

  const { recipient_address, amount, orderId, token } = payment;

  if (!recipient_address || !amount || !orderId || !token) {
    return {
      isValid: false,
      error:
        "Required payment details (recipient, amount, orderId, token) are missing.",
    };
  }
  if (orderId.length > 100) {
    return {
      isValid: false,
      error: "Order ID is too long for memo instruction (max 100 characters).",
    };
  }

  if (
    SplTokens[token as keyof typeof SplTokens] === undefined &&
    token !== "SOL"
  ) {
    return {
      isValid: false,
      error: "Invalid token.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

export const sendSolanaPaymentWithPhantom = async ({
  phantomSolana,
  payment,
}: {
  phantomSolana: PhantomSolanaProvider | null;
  payment: Payment;
}) => {
  const result: {
    phantomExtensionError: string | null;
    regularError: string | null;
    successMessage: string | null;
    signature: TransactionSignature | null;
  } = {
    phantomExtensionError: null,
    regularError: null,
    successMessage: null,
    signature: null,
  };

  // 1. --- Pre-checks ---
  const { isValid, error } = validatePhantomExtensionPayment({
    phantomSolana,
    payment,
  });
  if (!isValid || error) {
    result.phantomExtensionError = error || "Invalid payment details.";
    return result;
  }

  try {
    const { recipient_address, amount, orderId, token } = payment;
    // 2. --- Connect & Get Public Key ---
    const { publicKey } = await phantomSolana!.connect({
      onlyIfTrusted: false,
    }); // Ensure connection prompt if needed
    if (!publicKey) {
      throw new Error("Wallet connection failed or rejected.");
    }

    // 3. --- Initialize Connection ---
    const connection = new Connection(SOLANA_RPC_ENDPOINT, "confirmed");

    // 4. --- Create Instructions ---
    const instructions: TransactionInstruction[] = [];

    // 4a. Memo Instruction

    const memoInstruction = new TransactionInstruction({
      keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(orderId, "utf8"),
    });
    instructions.push(memoInstruction);

    // 4b. Payment Instruction (SOL or SPL)
    const recipientPubKey = new PublicKey(recipient_address);

    if (token === "SOL") {
      // SOL Transfer
      const lamports = Math.round(amount * LAMPORTS_PER_SOL); // Ensure integer lamports
      if (lamports <= 0) throw new Error("Invalid amount for SOL transfer.");

      instructions.push(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: lamports,
        })
      );
      console.log(
        `Prepared SOL transfer: ${lamports} lamports to ${recipient_address}`
      );
    } else {
      // SPL Token Transfer
      const { mint, decimals } = SplTokens[token as keyof typeof SplTokens];
      const mintPubKey = new PublicKey(mint);

      // Calculate token amount based on decimals
      const tokenAmount = new BigNumber(amount)
        .multipliedBy(Math.pow(10, decimals))
        .integerValue()
        .toNumber();
      if (tokenAmount <= 0) {
        throw new Error("Invalid amount for token transfer.");
      }

      // Get Associated Token Accounts
      const senderTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        publicKey
      );
      const recipientTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        recipientPubKey
      );

      instructions.push(
        createTransferInstruction(
          senderTokenAccount, // from
          recipientTokenAccount, // to
          publicKey, // owner/signer (sender's wallet)
          tokenAmount, // amount (in smallest unit)
          [], // multiSigners
          TOKEN_PROGRAM_ID // Token program ID
        )
      );
      console.log(
        `Prepared token transfer: ${tokenAmount} ${token} to ${recipient_address}`
      );
    }

    // 5. --- Create Transaction ---
    const transaction = new Transaction().add(...instructions);
    transaction.feePayer = publicKey;

    // 6. --- Fetch Blockhash ---
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    console.log(`Using blockhash: ${blockhash}`);

    // 7. --- Sign and Send ---
    console.log("Requesting signature and sending transaction...");
    const { signature }: { signature: TransactionSignature } =
      await phantomSolana!.signAndSendTransaction(transaction);
    console.log(`Transaction submitted with signature: ${signature}`);

    // 8. --- Confirmation (Optional but kept for immediate feedback) ---
    console.log("Waiting for transaction confirmation...");
    const signatureResult = await connection.confirmTransaction(
      {
        signature,
        blockhash: transaction.recentBlockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash())
          .lastValidBlockHeight,
      },
      "confirmed"
    );

    if (signatureResult.value.err) {
      result.regularError = "Transaction failed.";
      return result;
    }

    result.successMessage = `Payment sent successfully!`;
    result.signature = signature;
    return result;
  } catch (error: unknown) {
    let errorMessage = "Phantom payment failed.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    result.regularError = errorMessage;
  }
  return result;
};

// Standalone function to create Phantom deep link
export async function createPhantomPaymentUniversalLink(
  paymentRecord: Pick<
    PaymentTableRecord,
    "mpid" | "recipient_address" | "amount" | "token" | "blockchain" | "orderId"
  >,
  options: {
    dappEncryptionPublicKey: string;
    appUrl: string;
    decryptedConnectCallbackData: PhantomConnectCallbackData;
  }
): Promise<string> {
  // 1) Validate
  const schema = z.object({
    mpid: z.string(),
    recipient_address: z.string(),
    amount: z.number().positive(),
    token: z.string(),
    blockchain: z.literal("solana"),
    orderId: z.string(),
  });
  const { recipient_address, amount, token, orderId } =
    schema.parse(paymentRecord);

  // 2) Build Solana TX
  const conn = new Connection(SOLANA_RPC_ENDPOINT, "confirmed");
  const recipientPK = new PublicKey(recipient_address);
  const payerPK = new PublicKey(
    options.decryptedConnectCallbackData.public_key
  );
  const tx = new Transaction();
  const { mint, decimals } = SplTokens[token as keyof typeof SplTokens];

  // ensure ATA exists
  const ata = await getAssociatedTokenAddress(new PublicKey(mint), recipientPK);
  if (!(await conn.getAccountInfo(ata))) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        payerPK,
        ata,
        recipientPK,
        new PublicKey(mint)
      )
    );
  }

  // transfer
  const amountRaw = new BigNumber(amount)
    .multipliedBy(10 ** decimals)
    .integerValue()
    .toNumber();

  const payerAta = await getAssociatedTokenAddress(
    new PublicKey(mint),
    payerPK
  );
  tx.add(createTransferInstruction(payerAta, ata, payerPK, amountRaw));

  // memo
  tx.add({
    programId: MEMO_PROGRAM_ID,
    keys: [],
    data: Buffer.from(orderId),
  });

  // recent blockhash + feePayer
  const { blockhash } = await conn.getLatestBlockhash();
  tx.recentBlockhash = blockhash;
  tx.feePayer = payerPK;

  // 3) Serialize
  const serialized = tx
    .serialize({ requireAllSignatures: false })
    .toString("base64");

  // 4) Build Universal Link
  const nonceBytes = nacl.randomBytes(24);
  const ulParams = new URLSearchParams({
    dapp_encryption_public_key: options.dappEncryptionPublicKey,
    nonce: bs58.encode(nonceBytes),
    redirect_link: `${options.appUrl}/phantom/callback`,
    transaction: serialized,
    // cluster: "mainnet-beta" // optional; defaults to mainnet-beta
  });

  return `https://phantom.app/ul/v1/signAndSendTransaction?${ulParams}`;
}
