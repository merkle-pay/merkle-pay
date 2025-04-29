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

import { useMediaQuery } from "@react-hookz/web";
import { getPaymentRecordDescriptionData } from "src/utils/payment";
import { CfTurnstile, CfTurnstileHandle } from "src/components/cf-turnstile";

export default function PaymentConfirmPage({
  APP_URL,
  CF_TURNSTILE_SITE_KEY,
}: {
  APP_URL: string;
  CF_TURNSTILE_SITE_KEY: string;
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

  const cfTurnstileRef = useRef<CfTurnstileHandle>(null);

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

  return (
    <Space direction="vertical" size={48} className={styles.container}>
      <Space direction="vertical" size={8}>
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
          border
          size="large"
          column={isMobileLayout ? 1 : 2}
          colon=" : "
          layout="horizontal"
          data={getPaymentRecordDescriptionData(paymentTableRecord)}
          labelStyle={{ fontWeight: 600, color: "#000" }}
        />
        <WithQRCode
          isPaying={isPaying}
          setIsPaying={setIsPaying}
          urlForQrCode={urlForQrCode}
          paymentTableRecord={paymentTableRecord}
          setAlertMessage={setAlertMessage}
        />
        {phantomSolanaProvider && (
          <WithPhantomExtension
            isPaying={isPaying}
            setIsPaying={setIsPaying}
            setAlertMessage={setAlertMessage}
            phantomSolanaProvider={phantomSolanaProvider}
            paymentTableRecord={paymentTableRecord}
            goToUrl={goToUrl}
            paymentFormData={paymentFormData}
          />
        )}
        {isMobileDevice && (
          <WithPhantomApp
            isPaying={isPaying}
            setIsPaying={setIsPaying}
            mobilePhantomStep={mobilePhantomStep}
            setAlertMessage={setAlertMessage}
            paymentTableRecord={paymentTableRecord}
            APP_URL={APP_URL}
            cfTurnstileRef={cfTurnstileRef}
          />
        )}
      </Space>
      <CfTurnstile ref={cfTurnstileRef} siteKey={CF_TURNSTILE_SITE_KEY} />
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
          type="outline"
          status="success"
          onClick={() => {
            if (paymentTableRecord?.mpid) {
              goToUrl(`/pay/status?mpid=${paymentTableRecord.mpid}`);
            }
          }}
          disabled={!paymentTableRecord?.mpid}
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
  const CF_TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return {
    props: { APP_URL, CF_TURNSTILE_SITE_KEY },
  };
};
