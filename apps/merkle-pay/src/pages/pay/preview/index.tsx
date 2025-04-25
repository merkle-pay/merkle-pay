import {
  Button,
  Descriptions,
  Space,
  Typography,
  Alert,
} from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";
import { paymentSchema } from "../../../types/payment";
import { fromZodError } from "zod-validation-error";
import styles from "./index.module.scss";
import { IconArrowLeft } from "@arco-design/web-react/icon";
import { useMediaQuery } from "@react-hookz/web";
import { CfTurnstile } from "src/components/cf-turnstile";
import { createPaymentQuery } from "src/queries/payment";
import { useState } from "react";
import { AntibotToken } from "src/types/antibot";

export default function PaymentPreviewPage({
  TURNSTILE_SITE_KEY,
}: {
  TURNSTILE_SITE_KEY: string;
}) {
  const {
    payment: paymentValueFromStore,
    paymentFormUrl,
    setPaymentTableRecord,
    setUrlForQrCode,
    setReferencePublicKeyString,
  } = usePaymentStore();
  const router = useRouter();

  const isMobileLayout = useMediaQuery("(max-width: 768px)");
  const [isLoading, setIsLoading] = useState(false);
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

  const [alertMessage, setAlertMessage] = useState<{
    type: "error" | "success" | null;
    value: string | null;
  }>({
    type: null,
    value: null,
  });

  const {
    success,
    error,
    data: payment,
  } = paymentSchema.safeParse(paymentValueFromStore);

  // If there's no payment data, redirect back to the payment page
  if (!success) {
    // You can either redirect or show a message
    return (
      <Space direction="vertical" size={16}>
        <Typography.Title>Payment data is invalid</Typography.Title>
        <Typography.Text>{fromZodError(error).message}</Typography.Text>
        <Button type="outline" onClick={() => router.push("/pay")}>
          Back to Payment
        </Button>
      </Space>
    );
  }

  const handleConfirmPayment = async () => {
    const success = await createPaymentTableRecord();
    if (success) {
      router.push("/pay/confirm");
    }
  };

  const createPaymentTableRecord = async () => {
    if (!turnstileToken.isInitialized) {
      setAlertMessage({
        type: "error",
        value: "Turnstile token not initialized yet, please try again",
      });
      return;
    }

    if (turnstileToken.error) {
      setAlertMessage({
        type: "error",
        value: turnstileToken.error,
      });
      return;
    }

    if (turnstileToken.isExpired) {
      setAlertMessage({
        type: "error",
        value: "Turnstile token expired",
      });
      return;
    }

    if (!turnstileToken.token) {
      setAlertMessage({
        type: "error",
        value: "Turnstile token missing",
      });
      return;
    }

    if (
      payment.amount <= 0 ||
      !payment.blockchain ||
      !payment.token ||
      !payment.businessName ||
      !payment.recipient_address ||
      !payment.payer ||
      !payment.orderId ||
      !payment.returnUrl
    ) {
      setAlertMessage({
        type: "error",
        value: "Invalid payment",
      });
      return;
    }

    setIsLoading(true);
    setAlertMessage({
      type: null,
      value: null,
    });

    try {
      // Replace with your actual API call
      const { data, error } = await createPaymentQuery(
        payment,
        turnstileToken.token
      );
      if (error || !data) {
        setAlertMessage({
          type: "error",
          value: error,
        });
        return;
      }

      const { urlForQrCode, referencePublicKeyString, paymentTableRecord } =
        data;

      setPaymentTableRecord(paymentTableRecord);
      setUrlForQrCode(urlForQrCode);
      setReferencePublicKeyString(referencePublicKeyString);
      return true;
    } catch (err) {
      setAlertMessage({
        type: "error",
        value: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Space direction="vertical" size={16} className={styles.container}>
      {alertMessage.value && alertMessage.type === "error" && (
        <div className={styles.error}>
          <Alert
            closable
            style={{ marginBottom: 20 }}
            type="error"
            title="Error"
            content={alertMessage.value}
          />
        </div>
      )}
      {alertMessage.value && alertMessage.type === "success" && (
        <div className={styles.success}>
          <Alert
            closable
            type="success"
            title="Success"
            content={alertMessage.value}
          />
        </div>
      )}
      <h1>Payment Preview</h1>
      <Descriptions
        column={1}
        layout={isMobileLayout ? "vertical" : "horizontal"}
        data={[
          {
            label: "Payer",
            value: payment.payer,
          },
          {
            label: "Business Name",
            value: payment.businessName,
          },
          {
            label: "Order ID",
            value: payment.orderId,
          },
          {
            label: "Blockchain",
            value: payment.blockchain,
          },
          {
            label: "Amount",
            value: `${payment.amount} ${payment.token}`,
          },
          {
            label: "Recipient",
            value: payment.recipient_address,
          },
          {
            label: "Message",
            value: payment.message,
          },
          {
            label: "Return URL",
            value: payment.returnUrl,
          },
        ]}
        size={"medium"}
      />

      <CfTurnstile
        siteKey={TURNSTILE_SITE_KEY}
        handleTurnstileEvents={handleTurnstileEvents}
      />

      <Space size={16}>
        <Button
          type="outline"
          icon={<IconArrowLeft />}
          onClick={() => router.push(paymentFormUrl)}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="primary"
          disabled={isLoading}
          loading={isLoading}
          onClick={handleConfirmPayment}
        >
          Confirm Payment
        </Button>
      </Space>
    </Space>
  );
}

export const getServerSideProps = async () => {
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return {
    props: { TURNSTILE_SITE_KEY },
  };
};
