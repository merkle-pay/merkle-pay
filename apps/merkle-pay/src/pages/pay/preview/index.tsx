import { Button } from "react-aria-components";
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
      <div>
        <p>Payment data is invalid. Please return to the payment page.</p>
        <p>{fromError(error).message}</p>
        <button onClick={() => router.push("/pay")}>Back to Payment</button>
      </div>
    );
  }

  const handleConfirmPayment = () => {
    // TODO: Implement payment confirmation
    console.log("Payment confirmed");
  };

  return (
    <div>
      <h1>Payment Preview</h1>
      <p>
        Amount: {payment.amount} {payment.token}
      </p>
      <p>Blockchain: {payment.blockchain}</p>
      <p>Recipient: {payment.recipientAddress}</p>
      <p>Order ID: {payment.orderId}</p>

      <Button onPress={() => router.push("/pay")}>Back</Button>
      <Button onPress={handleConfirmPayment}>Confirm Payment</Button>
    </div>
  );
}
