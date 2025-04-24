import { Button, Space, Spin, Typography, Alert } from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";

import styles from "./index.module.scss";

import { useSolanaQR } from "../../../hooks/use-solana-qr";
import { IconArrowLeft, IconArrowRight } from "@arco-design/web-react/icon";
import { CfTurnstile } from "../../../components/cf-turnstile";
import { useState } from "react";
import { AntibotToken } from "src/types/antibot";
import {
  createPhantomPaymentUniversalLink,
  getPhantomSolana,
  sendSolanaPaymentWithPhantom,
} from "src/utils/solana";

import { Message } from "@arco-design/web-react";
import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";
import { useMediaQuery } from "@react-hookz/web";
import { generateAndSaveNaclKeys } from "src/queries/solana";
import { ls, LS_KEYS } from "src/utils/ls";
import { PhantomConnectCallbackData } from "src/utils/phantom";
import { PaymentTableRecord } from "src/utils/prisma";

export default function PaymentConfirmPage({
  TURNSTILE_SITE_KEY,
  APP_URL,
}: {
  TURNSTILE_SITE_KEY: string;
  APP_URL: string;
}) {
  const { payment, paymentFormUrl } = usePaymentStore();
  const router = useRouter();

  const phantomSolana = getPhantomSolana();
  const { isMobileDevice } = useIsMobileDevice();
  const isMobileLayout = useMediaQuery("(max-width: 768px)");

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

  const handlePaySolanaWithPhantomExtension = async () => {
    setIsPaying(true);
    const result = await sendSolanaPaymentWithPhantom({
      phantomSolana,
      payment,
    }).finally(() => {
      setIsPaying(false);
    });
    if (result.successMessage && result.signature) {
      Message.success(result.successMessage);

      const searchParams = new URLSearchParams();
      searchParams.set("mpid", paymentRecord.mpid || "");
      searchParams.set("txId", result.signature);
      router.push(`/pay/status?${searchParams.toString()}`);
    }

    if (result.phantomExtensionError) {
      setPhantomExtensionError(result.phantomExtensionError);
    }

    if (result.regularError) {
      Message.error(result.regularError);
    }
  };

  const handlePhantomApp = async () => {
    const phantomUniversalLinkParams = ls.get(
      LS_KEYS.PHANTOM_UNIVERSAL_LINK_PARAMS
    );

    try {
      const {
        dAppPublicKey,
        paymentRecord,
        expiry,
        decryptedConnectCallbackParams,
      } = JSON.parse(phantomUniversalLinkParams ?? "{}");

      if (
        dAppPublicKey &&
        paymentRecord &&
        expiry &&
        decryptedConnectCallbackParams &&
        Date.now() < expiry
      ) {
        await handlePaySolanaWithPhantomApp();
        return;
      }
    } catch (error) {
      console.error(
        error instanceof Error ? error.message : "Unexpected error"
      );
    }

    await handleConnectPhantomApp();
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
      Message.error(error || "Failed to generate DApp Encryption Public Key.");
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
        Message.error("Invalid Phantom Universal Link Params.");
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
      setPhantomExtensionError((error as Error).message);
    }
  };

  return (
    <Space direction="vertical" size={8} className={styles.container}>
      <Typography.Title className={styles.title}>
        Payment Confirmation
      </Typography.Title>
      <Typography.Title heading={6} className={styles.subtitle}>
        Please scan the QR code with supported wallets: Phantom, Solflare
      </Typography.Title>

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
      <Space size={8} direction={isMobileLayout ? "vertical" : "horizontal"}>
        {isLoadingQR || !paymentRecord.urlForQrCode ? (
          <div className={styles.loading}>
            <Spin size={48} tip="Generating Payment QR Code..." />
          </div>
        ) : (
          <div id="qr-code-container" ref={qrCodeRef} />
        )}

        {(isMobileDevice || phantomSolana) && (
          <div className={styles.phantomButton}>
            <Button
              type="primary"
              size="large"
              onClick={async () => {
                if (isMobileDevice) {
                  await handlePhantomApp();
                } else {
                  await handlePaySolanaWithPhantomExtension();
                }
              }}
              disabled={isLoadingQR || isPaying}
            >
              Pay with Phantom <br />
              {isMobileDevice ? "Mobile App" : "Wallet Extension"}
            </Button>
          </div>
        )}
      </Space>
      <CfTurnstile
        siteKey={TURNSTILE_SITE_KEY}
        handleVerification={handleTurnstileTokenVerification}
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
          className={styles.checkStatusButton}
          type="primary"
          onClick={() => {
            if (paymentRecord.mpid) {
              router.push(`/pay/status?mpid=${paymentRecord.mpid}`);
            }
          }}
          loading={isPaying}
          disabled={!paymentRecord.mpid || isPaying}
          icon={<IconArrowRight />}
        >
          I have paid. Check status
        </Button>
      </Space>
    </Space>
  );
}

export const getServerSideProps = async () => {
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return {
    props: { TURNSTILE_SITE_KEY, APP_URL },
  };
};
