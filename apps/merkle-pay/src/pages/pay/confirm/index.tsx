import { Button, Space, Spin, Typography, Alert } from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";

import styles from "./index.module.scss";

import { useSolanaQR } from "../../../hooks/use-solana-qr";
import { IconArrowLeft } from "@arco-design/web-react/icon";

export default function PaymentConfirmPage() {
  const { payment, paymentFormUrl } = usePaymentStore();
  const router = useRouter();

  const {
    qrCodeRef,
    paymentRecord,
    isLoading,
    error: qrCodeError,
  } = useSolanaQR({
    payment,
  });

  return (
    <Space direction="vertical" size={8} className={styles.container}>
      <Typography.Title className={styles.title}>
        Payment Confirmation
      </Typography.Title>
      <Typography.Title heading={6} className={styles.subtitle}>
        Please scan the QR code with your Phantom or Solflare wallet
      </Typography.Title>
      {isLoading && (
        <div className={styles.loading}>
          <Spin size={48} tip="Generating Payment QR Code..." />
        </div>
      )}
      {qrCodeError && (
        <div className={styles.error}>
          <Alert
            closable={false}
            style={{ marginBottom: 20 }}
            type="error"
            title="Error"
            content={qrCodeError}
          />
        </div>
      )}
      <div id="qr-code" ref={qrCodeRef} />
      <Space size={8} className={styles.buttons}>
        <Button
          type="outline"
          icon={<IconArrowLeft />}
          onClick={() => router.push(paymentFormUrl)}
        >
          Back to Payment Form
        </Button>
        <Button
          type="primary"
          onClick={() => {
            if (paymentRecord.mpid) {
              router.push(`/pay/status?mpid=${paymentRecord.mpid}`);
            }
          }}
          loading={isLoading}
        >
          I have finished paying on my wallet
        </Button>
      </Space>
    </Space>
  );
}
