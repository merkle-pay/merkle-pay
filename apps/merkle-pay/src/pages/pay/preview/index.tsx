import {
  Button,
  Descriptions,
  Space,
  Typography,
  Alert,
  Result,
} from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";
import { paymentFormDataSchema } from "../../../types/payment";
import { fromZodError } from "zod-validation-error";
import styles from "./index.module.scss";
import { IconArrowLeft } from "@arco-design/web-react/icon";
import { useMediaQuery } from "@react-hookz/web";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { createPaymentTableRecordQuery } from "src/queries/payment";
import { useRef, useState } from "react";
import { getPaymentFormDataDescriptionData } from "src/utils/payment";

export default function PaymentPreviewPage({
  TURNSTILE_SITE_KEY,
}: {
  TURNSTILE_SITE_KEY: string;
}) {
  const {
    paymentFormData: paymentFormDataValueFromStore,
    paymentFormUrl,
    setPaymentTableRecord,
    setUrlForSolanaPayQrCode,
    setReferencePublicKeyString,
  } = usePaymentStore();

  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const router = useRouter();

  const isMobileLayout = useMediaQuery("(max-width: 768px)");
  const [isLoading, setIsLoading] = useState(false);

  const [alertMessage, setAlertMessage] = useState<{
    type: "error" | "success" | null;
    value: React.ReactNode | null;
  }>({
    type: null,
    value: null,
  });

  const {
    success,
    error,
    data: validatedPaymentFormData,
  } = paymentFormDataSchema.safeParse(paymentFormDataValueFromStore);

  // If there's no payment data,
  // either it's because the paymentFormDataValueFromStore object is not initialized yet
  // or the paymentFormDataValueFromStore data is invalid
  // either way, redirect back to the payment page
  if (!success || !paymentFormDataValueFromStore.blockchain) {
    return (
      <Result
        status="error"
        title={
          paymentFormDataValueFromStore.blockchain
            ? "Payment form data is invalid"
            : "Payment form not filled"
        }
        subTitle={
          paymentFormDataValueFromStore.blockchain ? (
            <Space direction="vertical" size={16}>
              <Typography.Text>
                Please fill the payment form again.
              </Typography.Text>
              {fromZodError(error!).details.map((detail, index) => {
                return (
                  <Typography.Text key={index}>
                    {detail.message}
                  </Typography.Text>
                );
              })}
            </Space>
          ) : (
            `Please fill the payment form.`
          )
        }
        extra={[
          <Button
            key="again"
            type="primary"
            onClick={() => router.push("/pay")}
          >
            Fill the payment form
          </Button>,
        ]}
      ></Result>
    );
  }

  const handleConfirmPayment = async () => {
    const success = await createPaymentTableRecord();

    if (success) {
      router.push("/pay/confirm");
    } else {
      turnstileRef.current?.reset();
      setAlertMessage({
        type: "error",
        value: "Failed to create payment table record, please try again",
      });
    }
  };

  const createPaymentTableRecord = async () => {
    const antibotToken = await turnstileRef.current?.getResponsePromise();

    if (!antibotToken) {
      setAlertMessage({
        type: "error",
        value: "Turnstile token not initialized yet, please try again",
      });
      return;
    }

    if (
      validatedPaymentFormData.amount <= 0 ||
      !validatedPaymentFormData.blockchain ||
      !validatedPaymentFormData.token ||
      !validatedPaymentFormData.businessName ||
      !validatedPaymentFormData.recipient_address ||
      !validatedPaymentFormData.payer ||
      !validatedPaymentFormData.orderId ||
      !validatedPaymentFormData.returnUrl
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
      const { data, error } = await createPaymentTableRecordQuery(
        validatedPaymentFormData,
        antibotToken
      );

      if (error || !data) {
        setAlertMessage({
          type: "error",
          value: error,
        });
        return;
      }

      const {
        urlForSolanaPayQrCode,
        referencePublicKeyString,
        paymentTableRecord,
      } = data;

      if (validatedPaymentFormData.blockchain === "solana") {
        setPaymentTableRecord(paymentTableRecord);
        setUrlForSolanaPayQrCode(urlForSolanaPayQrCode ?? null);
        setReferencePublicKeyString(referencePublicKeyString ?? null);
        console.log("1", 1);
        return true;
      }

      if (validatedPaymentFormData.blockchain === "tron") {
        setPaymentTableRecord(paymentTableRecord);
        console.log("2", 2);
        return true;
      }

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
        column={isMobileLayout ? 1 : 2}
        border
        layout={"horizontal"}
        data={getPaymentFormDataDescriptionData(validatedPaymentFormData)}
        size={"medium"}
        labelStyle={{ fontWeight: 600, color: "#000" }}
        valueStyle={{
          overflowWrap: "break-word",
          wordBreak: "break-all",
          minWidth: "140px",
        }}
      />

      <Turnstile
        siteKey={TURNSTILE_SITE_KEY}
        ref={turnstileRef}
        options={{
          size: "flexible",
        }}
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
