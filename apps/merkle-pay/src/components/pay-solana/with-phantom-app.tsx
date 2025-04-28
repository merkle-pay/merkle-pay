import { Button } from "@arco-design/web-react";
import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";

import { generateAndSaveNaclKeys } from "src/queries/solana";
import { ls } from "src/utils/ls";

import { createPhantomPaymentUniversalLink } from "src/utils/solana";
import { paymentTableRecordSchema } from "src/types/payment";
import { z } from "zod";

export const WithPhantomApp = ({
  isPaying,
  setIsPaying,
  mobilePhantomStep,
  setAlertMessage,
  paymentTableRecord,
  APP_URL,
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
      const { dAppPublicKey, error, requestId } = await generateAndSaveNaclKeys(
        {
          mpid: paymentTableRecord.mpid,
          orderId: paymentTableRecord.orderId,
          paymentId: paymentTableRecord.id,
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
      } = ls.getPhantomUniversalLinkParams() ?? {};

      if (
        !dAppPublicKey ||
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

      const universalLink = await createPhantomPaymentUniversalLink(
        {
          recipient_address: paymentTableRecord.recipient_address,
          amount: paymentTableRecord.amount,
          token: paymentTableRecord.token,
          blockchain: paymentTableRecord.blockchain,
          orderId: paymentTableRecord.orderId,
          mpid: paymentTableRecord.mpid,
        },
        {
          dappEncryptionPublicKey: dAppPublicKey,
          appUrl: APP_URL,
          ...decryptedConnectCallbackData,
        }
      );
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
