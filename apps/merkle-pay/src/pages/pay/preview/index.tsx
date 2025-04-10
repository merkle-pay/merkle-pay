import {
  Button,
  Descriptions,
  Space,
  Typography,
} from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";
import { paymentSchema } from "../../../../types/payment";
import { fromError } from "zod-validation-error";
import styles from "./index.module.scss";
import { IconArrowLeft } from "@arco-design/web-react/icon";

export default function PaymentPreviewPage() {
  const { payment: paymentValueFromStore, paymentFormUrl } = usePaymentStore();
  const router = useRouter();

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
        <Typography.Text>{fromError(error).message}</Typography.Text>
        <Button type="outline" onClick={() => router.push("/pay")}>
          Back to Payment
        </Button>
      </Space>
    );
  }

  const handleConfirmPayment = () => {
    router.push("/pay/confirm");
  };

  return (
    <Space direction="vertical" size={16} className={styles.container}>
      <h1>Payment Preview</h1>
      <Descriptions
        column={1}
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

      <Space size={16}>
        <Button
          type="outline"
          icon={<IconArrowLeft />}
          onClick={() => router.push(paymentFormUrl)}
        >
          Back
        </Button>
        <Button type="primary" onClick={handleConfirmPayment}>
          Confirm Payment
        </Button>
      </Space>
    </Space>
  );
}
