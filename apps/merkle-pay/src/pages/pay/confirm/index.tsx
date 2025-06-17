import {
  Button,
  Space,
  Typography,
  Alert,
  Descriptions,
  Result,
} from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";
import styles from "./index.module.scss";
import { IconArrowLeft, IconArrowRight } from "@arco-design/web-react/icon";
import { useRef, useState } from "react";

import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";

import { useMediaQuery } from "@react-hookz/web";
import { getPaymentRecordDescriptionData } from "src/utils/payment";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { SolanaPaymentMethods } from "src/components/pay-solana";
import { TronPaymentMethods } from "src/components/pay-tron";

export default function PaymentConfirmPage({
  APP_URL,
  CF_TURNSTILE_SITE_KEY,
}: {
  APP_URL: string;
  CF_TURNSTILE_SITE_KEY: string;
}) {
  const { paymentFormUrl, paymentTableRecord } = usePaymentStore();
  const isMobileLayout = useMediaQuery("(max-width: 768px)");
  const router = useRouter();
  const goToUrl = (url: string) => {
    if (url) {
      router.push(url);
    }
  };

  const cfTurnstileRef = useRef<TurnstileInstance | null>(null);

  const { isMobileDevice } = useIsMobileDevice();

  const [alertMessage, setAlertMessage] = useState<{
    type: "error" | "success" | "info" | null;
    value: React.ReactNode | null;
  }>({
    type: null,
    value: null,
  });

  if (!paymentTableRecord) {
    return (
      <Result
        status="error"
        title="Payment not created or invalid"
        subTitle="Please fill the payment form."
        extra={[
          <Button key="again" type="primary" onClick={() => goToUrl("/pay")}>
            Fill the payment form
          </Button>,
        ]}
      ></Result>
    );
  }

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
        {paymentTableRecord?.blockchain === "solana" && (
          <SolanaPaymentMethods
            setAlertMessage={setAlertMessage}
            goToUrl={goToUrl}
            isMobileDevice={isMobileDevice}
            APP_URL={APP_URL}
            cfTurnstileRef={cfTurnstileRef}
          />
        )}
        {paymentTableRecord?.blockchain === "tron" && (
          <TronPaymentMethods
            setAlertMessage={setAlertMessage}
            isMobileDevice={isMobileDevice}
          />
        )}
      </Space>
      <Turnstile ref={cfTurnstileRef} siteKey={CF_TURNSTILE_SITE_KEY} />
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
