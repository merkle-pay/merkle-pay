import { getPaymentByMpid } from "src/services/payment";
import styles from "./index.module.scss";
import { Space, Typography, Spin } from "@arco-design/web-react";
import { GetServerSidePropsContext } from "next";
import { SETTLED_TX_STATUSES, MERKLE_PAY_EXPIRE_TIME } from "src/utils/solana";
import { useEffect, useState, useRef } from "react";
import { PaymentStatus } from "src/utils/prisma";
import { PaymentStatusApiResponse } from "src/types/payment";

type Props = {
  status: PaymentStatus | null;
  mpid: string | null;
  error: string | null;
  needPolling: boolean;
};

export default function PaymentStatusPage(props: Props) {
  const {
    status: initialStatus,
    mpid,
    error: initialError,
    needPolling: initialNeedPolling,
  } = props;

  const [displayStatus, setDisplayStatus] = useState<PaymentStatus | null>(
    initialStatus
  );
  const [displayError, setDisplayError] = useState<string | null>(initialError);
  const [isPollingActive, setIsPollingActive] =
    useState<boolean>(initialNeedPolling);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!mpid) {
        setDisplayError("MPID missing, cannot poll status.");
        setIsPollingActive(false);
        return;
      }

      try {
        const response = await fetch(`/api/payment/status?mpid=${mpid}`);
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const result: PaymentStatusApiResponse = await response.json();

        if (!result.data) {
          console.warn("API returned OK but no status data:", result);
          setDisplayError(
            result.message || "Received unexpected data from API."
          );
          return;
        }

        const newStatus = result.data.status;
        setDisplayStatus(newStatus);
        setDisplayError(null);

        if (SETTLED_TX_STATUSES.has(newStatus)) {
          console.log(`Polling stopped: Status settled to ${newStatus}`);
          setIsPollingActive(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
        setDisplayError(
          error instanceof Error ? error.message : "Failed to fetch status."
        );
      }
    };

    if (isPollingActive && mpid) {
      console.log("Starting polling...");
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(fetchStatus, 3000);
    } else {
      if (intervalRef.current) {
        console.log("Clearing interval as polling is inactive.");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        console.log(
          "Clearing interval on component unmount/dependency change."
        );
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPollingActive, mpid]);

  return (
    <Space direction="vertical" size="medium" className={styles.container}>
      <Typography.Title>Payment Status</Typography.Title>
      <Typography.Text>Payment MPID: {mpid ?? "Not found"}</Typography.Text>
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
    </Space>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { mpid } = context.query;

  if (typeof mpid !== "string" || !mpid) {
    return {
      props: {
        status: null,
        mpid: null,
        error: "MPID is required",
        needPolling: false,
      },
    };
  }

  const payment = await getPaymentByMpid(mpid as string);

  if (!payment) {
    return {
      props: {
        status: null,
        mpid,
        error: "Payment not found",
        needPolling: false,
      },
    };
  }

  const needPolling =
    !SETTLED_TX_STATUSES.has(payment.status) &&
    new Date(payment.createdAt).getTime() + MERKLE_PAY_EXPIRE_TIME > Date.now();

  return {
    props: {
      status: payment.status,
      mpid,
      error: null,
      needPolling,
    },
  };
};
