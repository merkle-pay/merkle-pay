import React from "react";

import { Button } from "@arco-design/web-react";
import { sendSolanaPaymentWithPhantom } from "src/utils/solana";
import { PhantomSolanaProvider } from "src/types/global";
import { PaymentTableRecord } from "src/utils/prisma";
import { NextRouter } from "next/router";
import { Payment } from "src/types/payment";

export const WithPhantomExtension = ({
  isPaying,
  setIsPaying,
  setAlertMessage,

  phantomSolanaProvider,
  paymentRecord,
  isLoadingQR,
  router,
  payment,
}: {
  isPaying: boolean;
  setIsPaying: (isPaying: boolean) => void;
  setAlertMessage: (error: {
    type: "error" | "success" | null;
    value: string | null;
  }) => void;

  phantomSolanaProvider: PhantomSolanaProvider | null;
  paymentRecord: Pick<
    PaymentTableRecord,
    | "id"
    | "mpid"
    | "orderId"
    | "referencePublicKey"
    | "recipient_address"
    | "amount"
    | "token"
    | "blockchain"
  > & {
    urlForQrCode: string | null;
    returnUrl: string;
  };
  isLoadingQR: boolean;
  router: NextRouter;
  payment: Payment;
}) => {
  const handlePaySolanaWithPhantomExtension = async () => {
    setIsPaying(true);
    const result = await sendSolanaPaymentWithPhantom({
      phantomSolanaProvider,
      payment,
    }).finally(() => {
      setIsPaying(false);
    });
    if (result.successMessage && result.signature) {
      setAlertMessage({
        type: "success",
        value: result.successMessage,
      });

      const searchParams = new URLSearchParams();
      searchParams.set("mpid", paymentRecord.mpid || "");
      searchParams.set("txId", result.signature);
      router.push(`/pay/status?${searchParams.toString()}`);
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
      onClick={async () => {
        await handlePaySolanaWithPhantomExtension();
      }}
      disabled={isLoadingQR || isPaying}
    >
      Pay with Phantom Extension
    </Button>
  );
};
