import { usePaymentStore } from "src/store/payment-store";
import { WithSolanaPayQrCode } from "./with-qrcode";
import { WithPhantomExtension } from "./with-phantom-extenstion";
import { WithPhantomApp } from "./with-phantom-app";
import { getPhantomProviders } from "src/utils/solana";
import { TurnstileInstance } from "@marsidev/react-turnstile";

export const SolanaPaymentMethods = ({
  setAlertMessage,
  goToUrl,
  isMobileDevice,
  APP_URL,
  cfTurnstileRef,
}: {
  setAlertMessage: (message: {
    type: "error" | "success" | "info" | null;
    value: React.ReactNode | null;
  }) => void;
  goToUrl: (url: string) => void;
  isMobileDevice: boolean;
  APP_URL: string;
  cfTurnstileRef: React.RefObject<TurnstileInstance | null>;
}) => {
  const { phantomSolanaProvider } = getPhantomProviders();
  const { paymentFormData, urlForSolanaPayQrCode, paymentTableRecord } =
    usePaymentStore();
  return (
    <div className="flex flex-col gap-2 w-full">
      <WithSolanaPayQrCode
        urlForSolanaPayQrCode={urlForSolanaPayQrCode}
        paymentTableRecord={paymentTableRecord}
        setAlertMessage={setAlertMessage}
      />
      {phantomSolanaProvider && (
        <WithPhantomExtension
          setAlertMessage={setAlertMessage}
          phantomSolanaProvider={phantomSolanaProvider}
          paymentTableRecord={paymentTableRecord}
          goToUrl={goToUrl}
          paymentFormData={paymentFormData}
        />
      )}
      {isMobileDevice && (
        <WithPhantomApp
          setAlertMessage={setAlertMessage}
          paymentTableRecord={paymentTableRecord}
          APP_URL={APP_URL}
          cfTurnstileRef={cfTurnstileRef}
        />
      )}
    </div>
  );
};
