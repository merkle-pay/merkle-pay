import React from "react";

import { Button } from "@arco-design/web-react";
import { sendSolanaPaymentWithPhantomExtension } from "src/utils/solana";
import { PhantomSolanaProvider } from "src/types/global";
import { z } from "zod";
import { PaymentFormData, paymentTableRecordSchema } from "src/types/payment";

export const WithPhantomExtension = ({
  setAlertMessage,
  phantomSolanaProvider,
  paymentTableRecord,
  goToUrl,
  paymentFormData,
}: {
  setAlertMessage: (error: {
    type: "error" | "success" | null;
    value: React.ReactNode | null;
  }) => void;
  phantomSolanaProvider: PhantomSolanaProvider | null;
  paymentTableRecord: z.infer<typeof paymentTableRecordSchema> | null;
  goToUrl: (url: string) => void;
  paymentFormData: PaymentFormData;
}) => {
  const handlePayWithPhantomExtension = async () => {
    const result = await sendSolanaPaymentWithPhantomExtension({
      phantomSolanaProvider,
      paymentFormData,
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
      size="large"
      onClick={handlePayWithPhantomExtension}
    >
      Pay with Phantom Extension
    </Button>
  );
};
