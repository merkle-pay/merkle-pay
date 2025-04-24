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
  createPhantomPaymentDeepLink,
  getPhantomSolana,
  sendSolanaPaymentWithPhantom,
} from "src/utils/solana";

import { Message } from "@arco-design/web-react";
import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";
import { useMediaQuery } from "@react-hookz/web";
import {
  generateAndSaveNaclKeys,
  generateDappEncryptionPublicKey,
} from "src/queries/solana";
import { ls, LS_KEYS } from "src/utils/ls";

export default function PaymentConfirmPage({
  turnstileSiteKey,
}: {
  turnstileSiteKey: string;
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

  const log = (message: string) => {
    setPhantomExtensionError(message);
  };

  const connectPhantomApp = async () => {
    const connectCallbackParams = ls.get(
      LS_KEYS.PHANTOM_CONNECT_CALLBACK_PARAMS
    );
    if (connectCallbackParams) {
      await handlePaySolanaWithPhantomApp();
      return;
    }

    await handleConnectPhantomApp();
  };

  const handleConnectPhantomApp = async () => {
    const { dAppPublicKey } = await generateAndSaveNaclKeys({
      mpid: paymentRecord.mpid,
      orderId: paymentRecord.orderId,
      paymentId: paymentRecord.id,
    });

    const phantomConnectBaseUrl = "https://phantom.app/ul/v1/connect";

    const params = new URLSearchParams({
      app_url: "https://demo.merklepay.io",
      dapp_encryption_public_key: dAppPublicKey,
      redirect_link: `https://demo.merklepay.io/phantom/connect-callback`,
    });

    const phantomConnectUrl = `${phantomConnectBaseUrl}?${params.toString()}`;

    window.open(phantomConnectUrl, "_blank");
  };

  const handlePaySolanaWithPhantomApp = async () => {
    // ! TODO: verify payment record
    // const { error } = await verifyPaymentRecord(paymentRecord);
    // if (error) {
    //   Message.error(error);
    //   return;
    // }

    try {
      const { dAppPublicKey } = await generateDappEncryptionPublicKey({
        mpid: paymentRecord.mpid,
        orderId: paymentRecord.orderId,
        paymentId: paymentRecord.id,
        log,
      });

      if (!dAppPublicKey) {
        return;
      }

      const appUrl =
        typeof window !== "undefined" ? window.location.origin : "";

      const deepLink = await createPhantomPaymentDeepLink(
        {
          recipient_address: paymentRecord.recipient_address,
          amount: paymentRecord.amount,
          token: paymentRecord.token,
          blockchain: paymentRecord.blockchain,
          orderId: paymentRecord.orderId,
          mpid: paymentRecord.mpid,
          referencePublicKey: paymentRecord.referencePublicKey,
        },
        {
          dappEncryptionPublicKey: dAppPublicKey,
          appUrl,
          log,
        }
      );
      if (deepLink) {
        window.open(deepLink, "_blank");
        // log(deepLink);
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
                  await connectPhantomApp();
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
        siteKey={turnstileSiteKey}
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
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return {
    props: { turnstileSiteKey },
  };
};
