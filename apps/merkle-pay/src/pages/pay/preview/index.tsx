import {
  Button,
  Descriptions,
  Space,
  Typography,
} from "@arco-design/web-react";
import { usePaymentContext } from "../../../context/PaymentContext";
import { useRouter } from "next/router";
import { paymentSchema } from "../../../../types/payment";
import { fromError } from "zod-validation-error";

export default function PayPreviewPage() {
  const { payment: paymentValueFromContext } = usePaymentContext();
  const router = useRouter();

  const {
    success,
    error,
    data: payment,
  } = paymentSchema.safeParse(paymentValueFromContext);

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
    // TODO: Implement payment confirmation
    console.log("Payment confirmed");
  };

  return (
    <Space direction="vertical" size={16}>
      <h1>Payment Preview</h1>
      <Descriptions
        column={1}
        data={[
          {
            label: "Payer",
            value: payment.payer,
          },
          {
            label: "App ID",
            value: payment.appId,
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
            label: "Order ID",
            value: payment.orderId,
          },
        ]}
        size={"medium"}
      />

      <Space size={16}>
        <Button type="outline" onClick={() => router.push("/pay")}>
          Back
        </Button>
        <Button type="primary" onClick={handleConfirmPayment}>
          Confirm Payment
        </Button>
      </Space>
    </Space>
  );
}
