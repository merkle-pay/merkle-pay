import React from "react";

import { Button } from "@arco-design/web-react";
import { sendSolanaPaymentWithPhantom } from "src/utils/solana";
import { PhantomSolanaProvider } from "src/types/global";
import { z } from "zod";
import { PaymentFormData, paymentTableRecordSchema } from "src/types/payment";

export const WithPhantomExtension = ({
  isPaying,
  setIsPaying,
  setAlertMessage,
  phantomSolanaProvider,
  paymentTableRecord,
  goToUrl,
  paymentFormData,
}: {
  isPaying: boolean;
  setIsPaying: (isPaying: boolean) => void;
  setAlertMessage: (error: {
    type: "error" | "success" | null;
    value: string | null;
  }) => void;
  phantomSolanaProvider: PhantomSolanaProvider | null;
  paymentTableRecord: z.infer<typeof paymentTableRecordSchema> | null;
  goToUrl: (url: string) => void;
  paymentFormData: PaymentFormData;
}) => {
  const handlePayWithPhantomExtension = async () => {
    setIsPaying(true);
    const result = await sendSolanaPaymentWithPhantom({
      phantomSolanaProvider,
      paymentFormData,
    }).finally(() => {
      setIsPaying(false);
    });

    if (result.successMessage && result.signature && paymentTableRecord?.mpid) {
      setAlertMessage({
        type: "success",
        value: result.successMessage,
      });

      const searchParams = new URLSearchParams();
      searchParams.set("mpid", paymentTableRecord.mpid);
      searchParams.set("txId", result.signature);
      goToUrl(`/pay/status?${searchParams.toString()}`);
    }

    if (result.alertMessage) {
      setAlertMessage({
        type: "error",
        value: result.alertMessage,
      });
    }
  };

  return (
    <Button
      type="primary"
      long
      onClick={handlePayWithPhantomExtension}
      disabled={isPaying}
    >
      Pay with Phantom Extension
    </Button>
  );
};
