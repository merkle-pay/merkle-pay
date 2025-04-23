import { getPaymentByMpid, updatePaymentTxId } from "src/services/payment";
import styles from "./index.module.scss";
import {
  Space,
  Typography,
  Spin,
  Link,
  Tooltip,
  Message,
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

  const [displayStatus, setDisplayStatus] = useState<PaymentStatus | null>(
    initialStatus
  );
  const [displayError, setDisplayError] = useState<string | null>(initialError);
  const [isPollingActive, setIsPollingActive] = useState<boolean>(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tryStatusRef = useRef<number>(0);
  const turnstileTokenHasBeenUsedRef = useRef<boolean>(false);

  const [antibotToken, setAntibotToken] = useState<AntibotToken>({
    token: "",
    error: "",
    isExpired: true,
    isInitialized: false,
  });

  console.log("antibotToken", antibotToken);

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
        if (turnstileTokenHasBeenUsedRef.current) {
          return;
        }

        tryStatusRef.current++;

        setIsPollingActive(true);

        const result = await fetchPaymentStatusQuery(mpid, antibotToken);
        turnstileTokenHasBeenUsedRef.current = true;

        if (result.error || !result.data) {
          setDisplayError(result.error || "Failed to fetch status.");
          setIsPollingActive(false);
          return;
        }

        const newStatus = result.data.status;

        if (SETTLED_TX_STATUSES.has(newStatus)) {
          setDisplayStatus(newStatus);
          setDisplayError(null);
          setIsPollingActive(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (error) {
        setDisplayError(
          error instanceof Error ? error.message : "Failed to fetch status."
        );
        setIsPollingActive(false);
      } finally {
        if (tryStatusRef.current >= MAX_TRY_STATUS) {
          setDisplayError(
            "Max try status reached, please contact support if the status is not settled."
          );
        }
      }
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mpid && needPolling && !txId) {
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
    txId,
    antibotToken.token,
    antibotToken.isInitialized,
    antibotToken.isExpired,
    antibotToken.error,
    antibotToken,
    needPolling,
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
          <Link href={`https://solscan.io/tx/${txId}`} target="_blank">
            View on Solscan
          </Link>
        </Space>
      )}
      {displayStatus && (
        <Typography.Text>
          Payment Status: {displayStatus}
          {isPollingActive && displayStatus === PaymentStatus.PENDING && (
            <Spin size={24} style={{ marginLeft: 8 }} />
          )}
        </Typography.Text>
      )}
      {displayError && (
        <Typography.Text type="error">Error: {displayError}</Typography.Text>
      )}
      <CfTurnstile
        siteKey={turnstileSiteKey}
        hasBeenUsed={turnstileTokenHasBeenUsedRef.current}
        handleVerification={handleAntibotToken}
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
