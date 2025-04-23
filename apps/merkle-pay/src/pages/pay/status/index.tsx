import { getPaymentByMpid, updatePaymentTxId } from "src/services/payment";
import styles from "./index.module.scss";
import {
  Space,
  Typography,
  Spin,
  Tooltip,
  Message,
  Button,
} from "@arco-design/web-react";
import { GetServerSidePropsContext } from "next";
import { SETTLED_TX_STATUSES, MAX_TRY_STATUS } from "src/utils/solana";
import { useEffect, useState, useRef, useCallback } from "react";
import { PaymentStatus } from "src/utils/prisma";

import { AntibotToken } from "src/types/antibot";
import { CfTurnstile } from "src/components/cf-turnstile";
import { fetchPaymentStatusQuery } from "src/queries/payment";

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

  const [antibotToken, setAntibotToken] = useState<AntibotToken>({
    token: "",
    error: "",
    isExpired: true,
    isInitialized: false,
  });
  const [antibotTokenHasBeenUsed, setAntibotTokenHasBeenUsed] =
    useState<boolean>(false);

  const handleAntibotToken = useCallback((params: AntibotToken) => {
    setAntibotToken((prev) => ({ ...prev, ...params }));
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!antibotToken.isInitialized) return;
        if (antibotToken.isExpired) return;
        if (antibotToken.error) return;
        if (!antibotToken.token) return;
        if (!mpid) return;
        if (antibotTokenHasBeenUsed) return;

        tryStatusRef.current++;

        const result = await fetchPaymentStatusQuery(mpid, antibotToken.token);
        setAntibotTokenHasBeenUsed(true);

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
  }, [
    mpid,
    antibotToken.token,
    antibotToken.isInitialized,
    antibotToken.isExpired,
    antibotToken.error,
    needPolling,
    antibotTokenHasBeenUsed,
    status.value,
  ]);

  return (
    <Space direction="vertical" size="medium" className={styles.container}>
      <Typography.Title>Payment Status</Typography.Title>
      <Typography.Text>Payment MPID: {mpid ?? "Not found"}</Typography.Text>
      {txId && (
        <Space direction="horizontal" size="medium">
          <Tooltip content={txId}>
            <Typography.Text
              className={styles.txIdText}
              onClick={async () => {
                await navigator.clipboard.writeText(txId);
                Message.success("txId copied to clipboard");
              }}
            >
              Payment TXID: {`${txId.slice(0, 8)}...${txId.slice(-8)}`}
            </Typography.Text>
          </Tooltip>
          <Button
            type="outline"
            href={`https://solscan.io/tx/${txId}`}
            target="_blank"
          >
            View on Solscan
          </Button>
        </Space>
      )}
      {status.value && (
        <Typography.Text>
          Payment Status: {status.value}
          {status.isFetching && <Spin size={24} style={{ marginLeft: 8 }} />}
        </Typography.Text>
      )}
      {status.error && (
        <Typography.Text type="error">Error: {status.error}</Typography.Text>
      )}
      <CfTurnstile
        siteKey={turnstileSiteKey}
        hasBeenUsed={antibotTokenHasBeenUsed}
        handleVerification={handleAntibotToken}
        setHasBeenUsed={setAntibotTokenHasBeenUsed}
      />
    </Space>
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
