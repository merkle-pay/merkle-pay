import { Button, Space, Typography, Alert } from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";

import styles from "./index.module.scss";

import { IconArrowLeft, IconArrowRight } from "@arco-design/web-react/icon";
import { CfTurnstile } from "../../../components/cf-turnstile";
import { useRef, useState } from "react";
import { AntibotToken } from "src/types/antibot";
import { getPhantomProviders } from "src/utils/solana";

import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";

import { WithQRCode } from "src/components/pay-solana/with-qrcode";
import { WithPhantomExtension } from "src/components/pay-solana/with-phantom-extenstion";
import { WithPhantomApp } from "src/components/pay-solana/with-phantom-app";
import QRCodeStyling from "@solana/qr-code-styling";
import { logoSvg } from "src/utils/logo";
import { createQROptions } from "@solana/pay";

export default function PaymentConfirmPage({
  TURNSTILE_SITE_KEY,
  APP_URL,
}: {
  TURNSTILE_SITE_KEY: string;
  APP_URL: string;
}) {
  const { payment, paymentFormUrl, urlForQrCode, paymentTableRecord } =
    usePaymentStore();
  const router = useRouter();
  const goToUrl = (url: string) => {
    if (url) {
      router.push(url);
    }
  };
  const { mobilePhantomStep = "connect" } = router.query as {
    mobilePhantomStep: "connect" | "sst";
  };
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { phantomSolanaProvider } = getPhantomProviders();
  const { isMobileDevice } = useIsMobileDevice();

  const [isPaying, setIsPaying] = useState(false);

  const [alertMessage, setAlertMessage] = useState<{
    type: "error" | "success" | "info" | null;
    value: string | null;
  }>({
    type: null,
    value: null,
  });

  const [turnstileToken, setTurnstileToken] = useState<AntibotToken>({
    token: "",
    error: "",
    isExpired: true,
    isInitialized: false,
  });

  const handleTurnstileEvents = (params: AntibotToken) => {
    setTurnstileToken((tt) => {
      return {
        ...tt,
        ...params,
      };
    });
  };

  const generateQrCode = async () => {
    if (!urlForQrCode || !paymentTableRecord?.mpid) {
      setAlertMessage({
        type: "error",
        value: urlForQrCode
          ? "QR code not generated properly"
          : "Invalid payment record",
      });
      return;
    }

    const logoDataUri = `data:image/svg+xml;base64,${btoa(logoSvg)}`;
    const options = createQROptions(urlForQrCode, 300);
    options.image = logoDataUri;

    const qrCode = new QRCodeStyling(options);
    const currentRef = qrCodeRef.current;
    if (qrCode && currentRef) {
      currentRef.innerHTML = "";
      qrCode.append(currentRef);
    } else {
      setAlertMessage({
        type: "info",
        value: "QR code not appended properly",
      });
    }
  };

  return (
    <Space direction="vertical" size={8} className={styles.container}>
      {alertMessage.value && alertMessage.type && (
        <div className={styles.error}>
          <Alert
            closable
            style={{ marginBottom: 20 }}
            type={alertMessage.type}
            title={alertMessage.type.toUpperCase()}
            content={alertMessage.value}
            onClose={() => {
              setAlertMessage({
                type: null,
                value: null,
              });
            }}
          />
        </div>
      )}
      <Typography.Title className={styles.title}>
        Payment Confirmation
      </Typography.Title>
      <Typography.Title heading={6} className={styles.subtitle}>
        Please scan the QR code with supported wallets: Phantom, Solflare
      </Typography.Title>

      <Space size={8} direction={"vertical"}>
        <WithQRCode qrCodeRef={qrCodeRef} generateQrCode={generateQrCode} />
        {phantomSolanaProvider && (
          <WithPhantomExtension
            isPaying={isPaying}
            setIsPaying={setIsPaying}
            setAlertMessage={setAlertMessage}
            phantomSolanaProvider={phantomSolanaProvider}
            paymentTableRecord={paymentTableRecord}
            goToUrl={goToUrl}
            payment={payment}
          />
        )}

        {/* {isMobileDevice && (
          <WithPhantomApp
            isLoadingQR={isLoadingQrCode}
            isPaying={isPaying}
            mobilePhantomStep={mobilePhantomStep}
            setAlertMessage={setAlertMessage}
            paymentRecord={paymentRecord}
            APP_URL={APP_URL}
          />
        )} */}
      </Space>
      <CfTurnstile
        siteKey={TURNSTILE_SITE_KEY}
        handleTurnstileEvents={handleTurnstileEvents}
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
            if (paymentTableRecord?.mpid) {
              router.push(`/pay/status?mpid=${paymentTableRecord.mpid}`);
            }
          }}
          loading={isPaying}
          disabled={!paymentTableRecord?.mpid || isPaying}
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
