import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";
import { paymentFormDataSchema } from "../../../types/payment";
import { fromZodError } from "zod-validation-error";
import { ArrowLeft } from "lucide-react";
import { useMediaQuery } from "@react-hookz/web";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { createPaymentTableRecordQuery } from "src/queries/payment";
import { useRef, useState } from "react";
import { getPaymentFormDataDescriptionData } from "src/utils/payment";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold">
          {paymentFormDataValueFromStore.blockchain
            ? "Payment form data is invalid"
            : "Payment form not filled"}
        </h2>
        <div className="flex flex-col gap-2 text-center text-muted-foreground">
          {paymentFormDataValueFromStore.blockchain ? (
            <>
              <p>Please fill the payment form again.</p>
              {fromZodError(error!).details.map((detail, index) => {
                return <p key={index}>{detail.message}</p>;
              })}
            </>
          ) : (
            <p>Please fill the payment form.</p>
          )}
        </div>
        <Button onClick={() => router.push("/pay")}>
          Fill the payment form
        </Button>
      </div>
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

  const descriptionData = getPaymentFormDataDescriptionData(validatedPaymentFormData);

  return (
    <div className="flex flex-col gap-4 w-full" style={{ maxWidth: '600px' }}>
      {alertMessage.value && alertMessage.type === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{alertMessage.value}</AlertDescription>
        </Alert>
      )}
      {alertMessage.value && alertMessage.type === "success" && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{alertMessage.value}</AlertDescription>
        </Alert>
      )}

      <h1>Payment Preview</h1>

      <div className="border rounded-md">
        <div className={`grid ${isMobileLayout ? 'grid-cols-1' : 'grid-cols-2'} divide-y ${!isMobileLayout && 'divide-x'}`}>
          {descriptionData.map((item, index) => (
            <div
              key={index}
              className={`flex ${isMobileLayout ? 'flex-col' : 'flex-row'} border-b last:border-b-0 ${
                index % 2 === 0 && !isMobileLayout ? '' : 'col-start-2'
              }`}
              style={{
                gridColumn: isMobileLayout ? '1' : index % 2 === 0 ? '1' : '2',
              }}
            >
              <div className="font-semibold bg-muted px-4 py-3 min-w-[140px]" style={{ color: '#000' }}>
                {item.label}
              </div>
              <div
                className="px-4 py-3 flex-1"
                style={{
                  overflowWrap: 'break-word',
                  wordBreak: 'break-all',
                  minWidth: '140px',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Turnstile
        siteKey={TURNSTILE_SITE_KEY}
        ref={turnstileRef}
        options={{
          size: "flexible",
        }}
      />

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push(paymentFormUrl)}
          disabled={isLoading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          disabled={isLoading}
          onClick={handleConfirmPayment}
        >
          {isLoading ? "Loading..." : "Confirm Payment"}
        </Button>
      </div>
    </div>
  );
}

export const getServerSideProps = async () => {
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  return {
    props: { TURNSTILE_SITE_KEY },
  };
};
