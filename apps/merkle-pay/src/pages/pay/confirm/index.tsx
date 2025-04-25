import { Button, Space, Typography, Alert } from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";

import styles from "./index.module.scss";

import { useSolanaQR } from "../../../hooks/use-solana-qr";
import { IconArrowLeft, IconArrowRight } from "@arco-design/web-react/icon";
import { CfTurnstile } from "../../../components/cf-turnstile";
import { useState } from "react";
import { AntibotToken } from "src/types/antibot";
import { getPhantomProviders } from "src/utils/solana";

import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";

import { WithQRCode } from "src/components/pay-solana/with-qrcode";
import { WithPhantomExtension } from "src/components/pay-solana/with-phantom-extenstion";
import { WithPhantomApp } from "src/components/pay-solana/with-phantom-app";

export default function PaymentConfirmPage({
  TURNSTILE_SITE_KEY,
  APP_URL,
}: {
  TURNSTILE_SITE_KEY: string;
  APP_URL: string;
}) {
  const { payment, paymentFormUrl } = usePaymentStore();
  const router = useRouter();
  const { mobilePhantomStep = "connect" } = router.query as {
    mobilePhantomStep: "connect" | "sst";
  };

  const { phantomSolanaProvider } = getPhantomProviders();
  const { isMobileDevice } = useIsMobileDevice();

  const [isPaying, setIsPaying] = useState(false);
  const [phantomExtensionError, setPhantomExtensionError] = useState<
    string | null
  >(null);
  const [regularError, setRegularError] = useState<string | null>(null);

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

  return (
    <Space direction="vertical" size={8} className={styles.container}>
      <Typography.Title className={styles.title}>
        Payment Confirmation
      </Typography.Title>
      <Typography.Title heading={6} className={styles.subtitle}>
        Please scan the QR code with supported wallets: Phantom, Solflare
      </Typography.Title>

      {(qrCodeError || phantomExtensionError || regularError) && (
        <div className={styles.error}>
          <Alert
            closable={false}
            style={{ marginBottom: 20 }}
            type="error"
            title="Error"
            content={qrCodeError || phantomExtensionError || regularError}
          />
        </div>
      )}
      <Space size={8} direction={"vertical"}>
        <WithQRCode qrCodeRef={qrCodeRef} />
        {phantomSolanaProvider && (
          <WithPhantomExtension
            isPaying={isPaying}
            setIsPaying={setIsPaying}
            setPhantomExtensionError={setPhantomExtensionError}
            setRegularError={setRegularError}
            phantomSolanaProvider={phantomSolanaProvider}
            paymentRecord={paymentRecord}
            isLoadingQR={isLoadingQR}
            router={router}
            payment={payment}
          />
        )}

        {isMobileDevice && (
          <WithPhantomApp
            isLoadingQR={isLoadingQR}
            isPaying={isPaying}
            mobilePhantomStep={mobilePhantomStep}
            setRegularError={setRegularError}
            paymentRecord={paymentRecord}
            APP_URL={APP_URL}
          />
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
