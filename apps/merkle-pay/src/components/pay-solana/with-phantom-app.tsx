import { Button } from "@arco-design/web-react";
import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";

import { generateAndSaveNaclKeys } from "src/queries/solana";
import { ls } from "src/utils/ls";

import { paymentTableRecordSchema } from "src/types/payment";
import { z } from "zod";
import { CfTurnstileHandle } from "../cf-turnstile";

export const WithPhantomApp = ({
  isPaying,
  setIsPaying,
  mobilePhantomStep,
  setAlertMessage,
  paymentTableRecord,
  APP_URL,
  cfTurnstileRef,
}: {
  isPaying: boolean;
  setIsPaying: (isPaying: boolean) => void;
  mobilePhantomStep: "connect" | "sst";
  setAlertMessage: (error: {
    type: "error" | "success" | "info" | null;
    value: string | null;
  }) => void;
  paymentTableRecord: z.infer<typeof paymentTableRecordSchema> | null;
  APP_URL: string;
  cfTurnstileRef: React.RefObject<CfTurnstileHandle | null>;
}) => {
  const { isMobileDevice } = useIsMobileDevice();

  const handlePhantomApp = async () => {
    try {
      if (mobilePhantomStep === "connect") {
        await handleConnectPhantomApp();
        return;
      }

      if (mobilePhantomStep === "sst") {
        await handlePaySolanaWithPhantomApp();
        return;
      }

      throw new Error("Invalid Phantom Step");
    } catch (error) {
      setAlertMessage({
        type: "error",
        value: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  };

  // step1: connect phantom app
  const handleConnectPhantomApp = async () => {
    if (!paymentTableRecord) {
      setAlertMessage({
        type: "error",
        value: "Payment table record not found.",
      });
      return;
    }
    try {
      setIsPaying(true);
      const antibotToken = await cfTurnstileRef.current?.getResponseAsync();
      const { dAppPublicKey, error, requestId } = await generateAndSaveNaclKeys(
        {
          mpid: paymentTableRecord.mpid,
          orderId: paymentTableRecord.orderId,
          paymentId: paymentTableRecord.id,
          antibotToken: antibotToken ?? "",
        }
      );

      if (error || !dAppPublicKey) {
        setAlertMessage({
          type: "error",
          value: error || "Failed to generate DApp Encryption Public Key.",
        });
        return;
      }

      // store dAppPublicKey and paymentRecord in local storage
      // and set expiry to 1 hour
      ls.setPhantomConnectCallbackParams({
        dAppPublicKey,
        paymentTableRecord,
        expiry: Date.now() + 60 * 60 * 1000, // 1 hour
      });

      const phantomConnectBaseUrl = "https://phantom.app/ul/v1/connect";

      const params = new URLSearchParams({
        app_url: APP_URL,
        dapp_encryption_public_key: dAppPublicKey,
        redirect_link: `${APP_URL}/phantom/connect-callback?requestId=${requestId}`,
      });

      const phantomConnectUrl = `${phantomConnectBaseUrl}?${params.toString()}`;

      window.location.href = phantomConnectUrl;
    } catch (error) {
      setAlertMessage({
        type: "error",
        value: `Failed to connect Phantom App: ${(error as Error).message}`,
      });
    } finally {
      setIsPaying(false);
    }
  };

  // step2: pay with phantom app
  const handlePaySolanaWithPhantomApp = async () => {
    try {
      const {
        dAppPublicKey,
        paymentTableRecord,
        expiry,
        decryptedConnectCallbackData,
        DAPP_PRIVATE_KEY_BASE58,
        PHANTOM_ENCRYPTION_PUBLIC_KEY,
      } = ls.getPhantomUniversalLinkParams() ?? {};

      if (
        !dAppPublicKey ||
        !DAPP_PRIVATE_KEY_BASE58 ||
        !paymentTableRecord ||
        !expiry ||
        !decryptedConnectCallbackData ||
        Date.now() >= expiry
      ) {
        setAlertMessage({
          type: "error",
          value: "Invalid Phantom Universal Link Params.",
        });
        return;
      }

      const partialPaymentRecord = {
        recipient_address: paymentTableRecord.recipient_address,
        amount: paymentTableRecord.amount,
        token: paymentTableRecord.token,
        blockchain: paymentTableRecord.blockchain,
        orderId: paymentTableRecord.orderId,
        mpid: paymentTableRecord.mpid,
        business_name: paymentTableRecord.business_name,
      };

      const options = {
        dappEncryptionPublicKey: dAppPublicKey,
        dappPrivateKeyBase58: DAPP_PRIVATE_KEY_BASE58,
        appUrl: APP_URL,
        ...decryptedConnectCallbackData,
        PHANTOM_ENCRYPTION_PUBLIC_KEY,
      };

      const antibotToken = await cfTurnstileRef.current?.getResponseAsync();

      const response = await fetch("/api/payment/phantom/deeplink", {
        method: "POST",
        body: JSON.stringify({ partialPaymentRecord, options }),
        headers: {
          "Content-Type": "application/json",
          "mp-antibot-token": antibotToken ?? "",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create Phantom Payment Universal Link.");
      }

      const { universalLink } = await response.json();

      if (universalLink) {
        window.location.href = universalLink;
      }
    } catch (error) {
      setAlertMessage({
        type: "error",
        value: (error as Error).message,
      });
    }
  };

  return (
    <Button
      type="primary"
      size="large"
      long
      onClick={async () => {
        await handlePhantomApp();
      }}
      disabled={isPaying}
    >
      Pay with Phantom {isMobileDevice ? "Mobile App" : "Wallet Extension"}
    </Button>
  );
};
