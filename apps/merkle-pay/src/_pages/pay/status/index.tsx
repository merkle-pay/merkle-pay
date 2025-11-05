import { getPaymentByMpid, updatePaymentTxId } from "src/services/payment";
import styles from "./index.module.scss";
import { GetServerSidePropsContext } from "next";
import { SETTLED_TX_STATUSES, MAX_TRY_STATUS } from "src/utils/solana";
import { useEffect, useState, useRef } from "react";
import { PaymentStatus } from "src/types/database";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { fetchPaymentStatusQuery } from "src/queries/payment";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Props = {
  status: PaymentStatus | null;
  mpid: string | null;
  txId: string | null;
  error: string | null;
  needPolling: boolean;
  turnstileSiteKey: string;
};

export default function PaymentStatusPage(props: Props) {
  const {
    status: initialStatus,
    mpid,
    txId,
    error: initialError,
    needPolling,
    turnstileSiteKey,
  } = props;

  const [status, setStatus] = useState<{
    value: PaymentStatus | null;
    error: string | null;
    isFetching: boolean;
  }>({
    value: initialStatus,
    error: initialError,
    isFetching: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tryStatusRef = useRef<number>(0);

  // !TODO: we need to reset the turnstile token after every poll
  const turnstileRef = useRef<TurnstileInstance>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const _antibotToken = await turnstileRef.current?.getResponsePromise();
        if (!_antibotToken) return;
        if (!mpid) return;

        tryStatusRef.current++;

        const result = await fetchPaymentStatusQuery(mpid, _antibotToken);
        turnstileRef.current?.reset();

        if (result.error || !result.data) {
          setStatus((prev) => ({
            ...prev,
            error: result.error || "Failed to fetch status.",
            isFetching: false,
          }));
          return;
        }

        const newStatus = result.data.status;

        if (SETTLED_TX_STATUSES.has(newStatus)) {
          setStatus((prev) => ({
            ...prev,
            value: newStatus,
            error: null,
            isFetching: false,
          }));

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to fetch status.",
          isFetching: false,
        }));
      } finally {
        if (tryStatusRef.current >= MAX_TRY_STATUS) {
          setStatus((prev) => ({
            ...prev,
            error:
              "We have tried to fetch the status of your payment 5 times. Please contact support if the status is not settled.",
            isFetching: false,
          }));
        }
      }
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (
      mpid &&
      needPolling &&
      (status.value === null || !SETTLED_TX_STATUSES.has(status.value)) &&
      tryStatusRef.current < MAX_TRY_STATUS
    ) {
      intervalRef.current = setInterval(fetchStatus, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mpid, needPolling, status.value]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1>Payment Status</h1>
      <p>Payment MPID: {mpid ?? "Not found"}</p>
      {txId && (
        <div className="flex items-center gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p
                  className={styles.txIdText}
                  onClick={async () => {
                    await navigator.clipboard.writeText(txId);
                    toast.success("txId copied to clipboard");
                  }}
                >
                  Payment TXID: {`${txId.slice(0, 8)}...${txId.slice(-8)}`}
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>{txId}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="outline"
            asChild
          >
            <a href={`https://solscan.io/tx/${txId}`} target="_blank" rel="noopener noreferrer">
              View on Solscan
            </a>
          </Button>
        </div>
      )}
      {status.value && (
        <div className="flex items-center gap-2">
          <p>Payment Status: {status.value}</p>
          {status.isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      )}
      {status.error && (
        <p className="text-destructive">Error: {status.error}</p>
      )}
      <Turnstile ref={turnstileRef} siteKey={turnstileSiteKey} />
    </div>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { mpid, txId, txid } = context.query;

  const _txId = txId || txid;

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  if (
    typeof mpid !== "string" ||
    !mpid ||
    (!!_txId && typeof _txId !== "string")
  ) {
    return {
      props: {
        status: null,
        mpid: null,
        txId: null,
        error: "Invalid query parameters",
        needPolling: false,
        turnstileSiteKey,
      },
    };
  }

  const payment = await getPaymentByMpid(mpid);

  // if the payment is not found
  // or the txId is not the same as the one in the query
  // return an error
  if (!payment || (!!payment.txId && !!_txId && payment.txId !== _txId)) {
    return {
      props: {
        status: null,
        mpid,
        txId: null,
        error: "Payment not found or txId mismatch",
        needPolling: false,
        turnstileSiteKey,
      },
    };
  }

  // if the payment is found and the txId is null or empty
  // update the txId
  if (!payment.txId && _txId) {
    await updatePaymentTxId(mpid, _txId);
  }

  const needPolling = !SETTLED_TX_STATUSES.has(payment.status);

  return {
    props: {
      status: payment.status,
      mpid,
      txId: payment.txId ?? null,
      error: null,
      needPolling,
      turnstileSiteKey,
    },
  };
};
