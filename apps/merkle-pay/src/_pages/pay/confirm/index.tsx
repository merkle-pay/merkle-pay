import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";
import styles from "./index.module.scss";
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { useIsMobileDevice } from "src/hooks/use-is-mobile-device";
import { useMediaQuery } from "@react-hookz/web";
import { getPaymentRecordDescriptionData } from "src/utils/payment";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { SolanaPaymentMethods } from "src/components/pay-solana";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    <div className="flex flex-col gap-12 w-full" style={{ maxWidth: '600px' }}>
      <div className="flex flex-col gap-2">
        {alertMessage.value && alertMessage.type && (
          <Alert variant={alertMessage.type === "error" ? "destructive" : "default"}>
            <AlertTitle>{alertMessage.type.toUpperCase()}</AlertTitle>
            <AlertDescription>{alertMessage.value}</AlertDescription>
          </Alert>
        )}
        <h1 className={styles.title}>Payment Confirmation</h1>
        <div className="border rounded-md">
          <div className={`grid ${isMobileLayout ? 'grid-cols-1' : 'grid-cols-2'} divide-y ${!isMobileLayout && 'divide-x'}`}>
            {descriptionData.map((item, index) => (
              <div
                key={index}
                className={`flex ${isMobileLayout ? 'flex-col' : 'flex-row'} border-b last:border-b-0`}
                style={{
                  gridColumn: isMobileLayout ? '1' : index % 2 === 0 ? '1' : '2',
                }}
              >
                <div className="font-semibold bg-muted px-4 py-3 min-w-[140px]" style={{ color: '#000' }}>
                  {item.label}
                </div>
                <div className="px-4 py-3 flex-1">
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
      </div>
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
          className={styles.checkStatusButton}
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

export const getServerSideProps = async () => {
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const CF_TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  return {
    props: { APP_URL, CF_TURNSTILE_SITE_KEY },
  };
};
