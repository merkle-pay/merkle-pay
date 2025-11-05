import { getPaymentByMpid, updatePaymentTxId } from "src/services/payment";
import { SETTLED_TX_STATUSES } from "src/utils/solana";
import PaymentStatusClient from "./payment-status-client";

type PageProps = {
  searchParams: Promise<{ mpid?: string; txId?: string; txid?: string }>;
};

export default async function PaymentStatusPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const mpid = params.mpid;
  const txIdFromUrl = params.txId || params.txid;

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  // Validate params
  if (!mpid || (!!txIdFromUrl && typeof txIdFromUrl !== "string")) {
    return (
      <PaymentStatusClient
        status={null}
        mpid={null}
        txId={null}
        error="Invalid query parameters"
        needPolling={false}
        turnstileSiteKey={turnstileSiteKey}
      />
    );
  }

  // Fetch payment
  const payment = await getPaymentByMpid(mpid);

  // Payment not found or txId mismatch
  if (
    !payment ||
    (!!payment.txId && !!txIdFromUrl && payment.txId !== txIdFromUrl)
  ) {
    return (
      <PaymentStatusClient
        status={null}
        mpid={mpid}
        txId={null}
        error="Payment not found or txId mismatch"
        needPolling={false}
        turnstileSiteKey={turnstileSiteKey}
      />
    );
  }

  // Update txId if needed
  if (!payment.txId && txIdFromUrl) {
    await updatePaymentTxId(mpid, txIdFromUrl);
  }

  const needPolling = !SETTLED_TX_STATUSES.has(payment.status);

  return (
    <PaymentStatusClient
      status={payment.status}
      mpid={mpid}
      txId={payment.txId ?? null}
      error={null}
      needPolling={needPolling}
      turnstileSiteKey={turnstileSiteKey}
    />
  );
}
