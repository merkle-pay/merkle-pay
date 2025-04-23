import { Button, Space, Spin, Typography, Alert } from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";

import styles from "./index.module.scss";

import { useSolanaQR } from "../../../hooks/use-solana-qr";
import { IconArrowLeft } from "@arco-design/web-react/icon";
import { CfTurnstile } from "../../../components/cf-turnstile";
import { useRef, useState } from "react";
import { AntibotToken } from "src/types/antibot";
import {
  getPhantomSolana,
  MEMO_PROGRAM_ID,
  SOLANA_RPC_ENDPOINT,
  SplTokens,
  validatePhantomExtensionPayment,
} from "src/utils/solana";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Connection,
  TransactionSignature,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BigNumber from "bignumber.js";
import { Message } from "@arco-design/web-react";

export default function PaymentConfirmPage({
  turnstileSiteKey,
}: {
  turnstileSiteKey: string;
}) {
  const { payment, paymentFormUrl } = usePaymentStore();
  const router = useRouter();

  const phantomSolana = getPhantomSolana();

  const [isPaying, setIsPaying] = useState(false);
  const [phantomExtensionError, setPhantomExtensionError] = useState<
    string | null
  >(null);

  const [turnstileToken, setTurnstileToken] = useState<AntibotToken>({
    token: "",
    error: "",
    isExpired: true,
    isInitialized: false,
  });

  const handleTurnstileTokenVerification = (params: AntibotToken) => {
    setTurnstileToken((tt) => {
      return {
        ...tt,
        ...params,
      };
    });
  };

  const {
    qrCodeRef,
    paymentRecord,
    isLoading: isLoadingQR,
    error: qrCodeError,
  } = useSolanaQR({
    payment,
    antibotToken: turnstileToken,
  });

  // TODO: set it to true when the user has used the turnstile token
  const turnstileTokenHasBeenUsedRef = useRef<boolean>(false);

  const handlePayWithPhantom = async () => {
    // 1. --- Pre-checks ---
    const { isValid, error } = validatePhantomExtensionPayment({
      phantomSolana,
      payment,
    });
    if (!isValid || error) {
      setPhantomExtensionError(error || "Invalid payment details.");
      return;
    }

    try {
      setIsPaying(true);
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
      Message.success(
        `Transaction sent! Signature: ${signature.substring(0, 10)}...`
      );

      // 8. --- Confirmation (Optional but kept for immediate feedback) ---
      console.log("Waiting for transaction confirmation...");
      await connection.confirmTransaction(
        {
          signature,
          blockhash: transaction.recentBlockhash,
          lastValidBlockHeight: (await connection.getLatestBlockhash())
            .lastValidBlockHeight,
        },
        "confirmed"
      );
      console.log("Transaction confirmed by node.");
      Message.success(`Transaction confirmed!`);

      // 9. --- Navigate on Success ---
      // Pass both mpid (orderId) and signature to the status page
      const searchParams = new URLSearchParams();
      searchParams.set("mpid", paymentRecord.mpid || "");
      searchParams.set("txId", signature);
      router.push(`/pay/status?${searchParams.toString()}`);
    } catch (error: unknown) {
      let errorMessage = "Phantom payment failed.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }
      // Try to provide more specific user messages for common errors
      if (errorMessage.includes("User rejected the request")) {
        errorMessage = "Transaction rejected in wallet.";
      } else if (errorMessage.includes("Failed to fetch")) {
        errorMessage =
          "Network error. Please check your connection or RPC endpoint.";
      } else if (errorMessage.includes("Account not found")) {
        errorMessage =
          "Token account not found. Ensure the recipient has an account for this token.";
      }
      setPhantomExtensionError(errorMessage);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Space direction="vertical" size={8} className={styles.container}>
      <Typography.Title className={styles.title}>
        Payment Confirmation
      </Typography.Title>
      <Typography.Title heading={6} className={styles.subtitle}>
        Please scan the QR code with your Phantom or Solflare wallet
      </Typography.Title>
      {isLoadingQR && (
        <div className={styles.loading}>
          <Spin size={48} tip="Generating Payment QR Code..." />
        </div>
      )}
      {(qrCodeError || phantomExtensionError) && (
        <div className={styles.error}>
          <Alert
            closable={false}
            style={{ marginBottom: 20 }}
            type="error"
            title="Error"
            content={qrCodeError || phantomExtensionError}
          />
        </div>
      )}
      <Space size={8}>
        <div id="qr-code-container" ref={qrCodeRef} />
        {!!phantomSolana && !phantomExtensionError && (
          <div className={styles.phantomButton}>
            <Button
              type="primary"
              size="large"
              onClick={handlePayWithPhantom}
              disabled={isLoadingQR || isPaying}
            >
              Pay with Phantom <br />
              Wallet Extension
            </Button>
          </div>
        )}
      </Space>
      <CfTurnstile
        siteKey={turnstileSiteKey}
        handleVerification={handleTurnstileTokenVerification}
        hasBeenUsed={turnstileTokenHasBeenUsedRef.current}
      />
      <Space size={8} className={styles.buttons}>
        <Button
          type="outline"
          icon={<IconArrowLeft />}
          onClick={() => {
            router.push(paymentFormUrl || "/pay");
          }}
        >
          Back to Payment Form
        </Button>

        <Button
          type="primary"
          onClick={() => {
            if (paymentRecord.mpid) {
              router.push(`/pay/status?mpid=${paymentRecord.mpid}`);
            }
          }}
          loading={isPaying}
          disabled={!paymentRecord.mpid || isPaying}
        >
          I have paid
        </Button>
      </Space>
    </Space>
  );
}

export const getServerSideProps = async () => {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return {
    props: { turnstileSiteKey },
  };
};
