import { Button } from "@arco-design/web-react";
import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";

import { generateAndSaveNaclKeys } from "src/queries/solana";

import { paymentTableRecordSchema } from "src/types/payment";
import { z } from "zod";
import { CfTurnstileHandle } from "../cf-turnstile";

export const WithPhantomApp = ({
  setAlertMessage,
  paymentTableRecord,
  APP_URL,
  cfTurnstileRef,
}: {
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
      await handleConnectPhantomApp();
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
    >
      Pay with Phantom {isMobileDevice ? "Mobile App" : "Wallet Extension"}
    </Button>
  );
};
