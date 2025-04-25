import React from "react";

import { Button, Message } from "@arco-design/web-react";
import { sendSolanaPaymentWithPhantom } from "src/utils/solana";
import { PhantomSolanaProvider } from "src/types/global";
import { PaymentTableRecord } from "src/utils/prisma";
import { NextRouter } from "next/router";
import { Payment } from "src/types/payment";

export const WithPhantomExtension = ({
  isPaying,
  setIsPaying,
  setPhantomExtensionError,
  setRegularError,
  phantomSolanaProvider,
  paymentRecord,
  isLoadingQR,
  router,
  payment,
}: {
  isPaying: boolean;
  setIsPaying: (isPaying: boolean) => void;
  setPhantomExtensionError: (error: string) => void;
  setRegularError: (error: string) => void;
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
      Message.success(result.successMessage);

      const searchParams = new URLSearchParams();
      searchParams.set("mpid", paymentRecord.mpid || "");
      searchParams.set("txId", result.signature);
      router.push(`/pay/status?${searchParams.toString()}`);
    }

    if (result.phantomExtensionError) {
      setPhantomExtensionError(result.phantomExtensionError);
    }

    if (result.regularError) {
      setRegularError(result.regularError);
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
