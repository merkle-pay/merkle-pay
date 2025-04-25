import {
  Button,
  Space,
  Typography,
  Alert,
  Descriptions,
} from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";
import styles from "./index.module.scss";
import { IconArrowLeft, IconArrowRight } from "@arco-design/web-react/icon";
import { useRef, useState } from "react";
import { getPhantomProviders } from "src/utils/solana";
import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";
import { WithQRCode } from "src/components/pay-solana/with-qrcode";
import { WithPhantomExtension } from "src/components/pay-solana/with-phantom-extenstion";
import { WithPhantomApp } from "src/components/pay-solana/with-phantom-app";
import QRCodeStyling from "@solana/qr-code-styling";
import { logoSvg } from "src/utils/logo";
import { createQROptions } from "@solana/pay";
import { useMediaQuery } from "@react-hookz/web";

export default function PaymentConfirmPage({
  APP_URL,
}: {
  TURNSTILE_SITE_KEY: string;
  APP_URL: string;
}) {
  const { paymentFormData, paymentFormUrl, urlForQrCode, paymentTableRecord } =
    usePaymentStore();
  const isMobileLayout = useMediaQuery("(max-width: 768px)");
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

  const [isPayingWithPhantomExtension, setIsPayingWithPhantomExtension] =
    useState(false);

  const [alertMessage, setAlertMessage] = useState<{
    type: "error" | "success" | "info" | null;
    value: string | null;
  }>({
    type: null,
    value: null,
  });

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

  const descriptionData = Object.entries(paymentTableRecord ?? {})
    .filter(([key]) => key !== "raw")
    .map(([key, value]) => ({
      key: key,
      label: key,
      value: value ?? "",
    }));

  return (
    <Space direction="vertical" size={8} className={styles.container}>
      {alertMessage.value && alertMessage.type && (
        <Alert
          closable
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
      )}
      <Typography.Title className={styles.title}>
        Payment Confirmation
      </Typography.Title>
      <Descriptions
        size="large"
        column={isMobileLayout ? 1 : 2}
        colon=" : "
        layout="horizontal"
        data={descriptionData}
        labelStyle={{ fontWeight: 600, color: "#000" }}
      />
      <WithQRCode qrCodeRef={qrCodeRef} generateQrCode={generateQrCode} />
      {phantomSolanaProvider && (
        <WithPhantomExtension
          isPaying={isPayingWithPhantomExtension}
          setIsPaying={setIsPayingWithPhantomExtension}
          setAlertMessage={setAlertMessage}
          phantomSolanaProvider={phantomSolanaProvider}
          paymentTableRecord={paymentTableRecord}
          goToUrl={goToUrl}
          paymentFormData={paymentFormData}
        />
      )}
      {isMobileDevice && (
        <WithPhantomApp
          isPayingWithPhantomExtension={isPayingWithPhantomExtension}
          mobilePhantomStep={mobilePhantomStep}
          setAlertMessage={setAlertMessage}
          paymentTableRecord={paymentTableRecord}
          APP_URL={APP_URL}
        />
      )}
      <Space size={8} className={styles.buttons}>
        <Button
          type="outline"
          icon={<IconArrowLeft />}
          onClick={() => {
            goToUrl(paymentFormUrl || "/pay");
          }}
        >
          Back to Payment Form
        </Button>

        <Button
          className={styles.checkStatusButton}
          type="primary"
          onClick={() => {
            if (paymentTableRecord?.mpid) {
              goToUrl(`/pay/status?mpid=${paymentTableRecord.mpid}`);
            }
          }}
          loading={isPayingWithPhantomExtension}
          disabled={!paymentTableRecord?.mpid || isPayingWithPhantomExtension}
          icon={<IconArrowRight />}
        >
          I have paid. Check status
        </Button>
      </Space>
    </Space>
  );
}

export const getServerSideProps = async () => {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return {
    props: { APP_URL },
  };
};
