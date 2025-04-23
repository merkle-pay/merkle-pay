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
  getPhantomSolana,
  sendSolanaPaymentWithPhantom,
} from "src/utils/solana";

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

  const handlePaySolanaWithPhantom = async () => {
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

  return (
    <Space direction="vertical" size={8} className={styles.container}>
      <Typography.Title className={styles.title}>
        Payment Confirmation
      </Typography.Title>
      <Typography.Title heading={6} className={styles.subtitle}>
        Please scan the QR code with supported wallets: Phantom, Solflare
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
              onClick={handlePaySolanaWithPhantom}
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
