import { Button } from "@arco-design/web-react";
import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";
import { LS_KEYS } from "src/utils/ls";
import { generateAndSaveNaclKeys } from "src/queries/solana";
import { ls } from "src/utils/ls";
import { PaymentTableRecord } from "src/utils/prisma";
import { PhantomConnectCallbackData } from "src/utils/phantom";
import { createPhantomPaymentUniversalLink } from "src/utils/solana";

export const WithPhantomApp = ({
  isLoadingQR,
  isPaying,
  mobilePhantomStep,
  setAlertMessage,
  paymentRecord,
  APP_URL,
}: {
  isLoadingQR: boolean;
  isPaying: boolean;
  mobilePhantomStep: "connect" | "sst";
  setAlertMessage: (error: {
    type: "error" | "success" | null;
    value: string | null;
  }) => void;
  paymentRecord: Pick<
    PaymentTableRecord,
    | "id"
    | "mpid"
    | "orderId"
    | "referencePublicKey"
    | "recipient_address"
    | "amount"
    | "token"
    | "blockchain"
  > & {
    urlForQrCode: string | null;
    returnUrl: string;
  };
  APP_URL: string;
}) => {
  const { isMobileDevice } = useIsMobileDevice();

  const handlePhantomApp = async () => {
    try {
      if (mobilePhantomStep === "connect") {
        await handleConnectPhantomApp();
      }

      if (mobilePhantomStep === "sst") {
        await handlePaySolanaWithPhantomApp();
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
    // ! TODO: verify payment record
    // const { error } = await verifyPaymentRecord(paymentRecord);
    // if (error) {
    //   Message.error(error);
    //   return;
    // }
    const { dAppPublicKey, error } = await generateAndSaveNaclKeys({
      mpid: paymentRecord.mpid,
      orderId: paymentRecord.orderId,
      paymentId: paymentRecord.id,
    });

    if (error || !dAppPublicKey) {
      setAlertMessage({
        type: "error",
        value: error || "Failed to generate DApp Encryption Public Key.",
      });
      return;
    }

    // store dAppPublicKey and paymentRecord in local storage
    // and set expiry to 1 hour
    ls.set(
      LS_KEYS.PHANTOM_UNIVERSAL_LINK_PARAMS,
      JSON.stringify({
        dAppPublicKey,
        paymentRecord,
        expiry: Date.now() + 60 * 60 * 1000, // 1 hour
      })
    );

    const phantomConnectBaseUrl = "https://phantom.app/ul/v1/connect";

    const params = new URLSearchParams({
      app_url: APP_URL,
      dapp_encryption_public_key: dAppPublicKey,
      redirect_link: `${APP_URL}/phantom/connect-callback`,
    });

    const phantomConnectUrl = `${phantomConnectBaseUrl}?${params.toString()}`;

    window.open(phantomConnectUrl, "_blank");
  };

  // step2: pay with phantom app
  const handlePaySolanaWithPhantomApp = async () => {
    try {
      const {
        dAppPublicKey,
        paymentRecord,
        expiry,
        decryptedConnectCallbackData,
      } = JSON.parse(ls.get(LS_KEYS.PHANTOM_UNIVERSAL_LINK_PARAMS) ?? "{}") as {
        dAppPublicKey: string;
        paymentRecord: Pick<
          PaymentTableRecord,
          | "id"
          | "mpid"
          | "orderId"
          | "referencePublicKey"
          | "recipient_address"
          | "amount"
          | "token"
          | "blockchain"
        > & {
          urlForQrCode: string | null;
          returnUrl: string;
        };
        expiry: number;
        decryptedConnectCallbackData: PhantomConnectCallbackData;
      };

      if (
        !dAppPublicKey ||
        !paymentRecord ||
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
          recipient_address: paymentRecord.recipient_address,
          amount: paymentRecord.amount,
          token: paymentRecord.token,
          blockchain: paymentRecord.blockchain,
          orderId: paymentRecord.orderId,
          mpid: paymentRecord.mpid,
        },
        {
          dappEncryptionPublicKey: dAppPublicKey,
          appUrl: APP_URL,
          decryptedConnectCallbackData,
        }
      );
      if (universalLink) {
        window.open(universalLink, "_blank");
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
      onClick={async () => {
        await handlePhantomApp();
      }}
      disabled={isLoadingQR || isPaying}
    >
      Pay with Phantom <br />
      {isMobileDevice ? "Mobile App" : "Wallet Extension"}
    </Button>
  );
};
