"use client";

import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";
import { getPaymentRecordDescriptionData } from "src/utils/payment";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { SolanaPaymentMethods } from "src/components/pay-solana";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function PaymentConfirmPage() {
  const { paymentFormUrl, paymentTableRecord } = usePaymentStore();
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

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const CF_TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  if (!paymentTableRecord) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold">Payment not created or invalid</h2>
        <p className="text-muted-foreground">Please fill the payment form.</p>
        <Button onClick={() => goToUrl("/pay")}>
          Fill the payment form
        </Button>
      </div>
    );
  }

  const descriptionData = getPaymentRecordDescriptionData(paymentTableRecord);

  return (
    <div className="flex flex-col gap-6 w-full h-full mx-auto px-4 mt-5" style={{ maxWidth: '600px' }}>
      {alertMessage.value && alertMessage.type && (
        <Alert variant={alertMessage.type === "error" ? "destructive" : "default"}>
          <AlertTitle className="capitalize">{alertMessage.type}</AlertTitle>
          <AlertDescription>{alertMessage.value}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="bg-muted px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Payment Confirmation</h2>
        </div>
        <div className="divide-y">
          {descriptionData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center px-6 py-4 gap-2 sm:gap-4"
            >
              <div className="font-medium text-muted-foreground min-w-[140px]">
                {item.label}
              </div>
              <div className="flex-1 font-mono text-sm break-all">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {paymentTableRecord?.blockchain === "solana" && (
        <SolanaPaymentMethods
          setAlertMessage={setAlertMessage}
          goToUrl={goToUrl}
          isMobileDevice={isMobileDevice}
          APP_URL={APP_URL}
          cfTurnstileRef={cfTurnstileRef}
        />
      )}

      <Turnstile ref={cfTurnstileRef} siteKey={CF_TURNSTILE_SITE_KEY} />

      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          onClick={() => {
            goToUrl(paymentFormUrl || "/pay");
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payment Form
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            if (paymentTableRecord?.mpid) {
              goToUrl(`/pay/status?mpid=${paymentTableRecord.mpid}`);
            }
          }}
          disabled={!paymentTableRecord?.mpid}
        >
          I have paid. Check status
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
