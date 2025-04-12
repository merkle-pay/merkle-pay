import { getPaymentByMpid } from "src/services/payment";
import styles from "./index.module.scss";
import { Space, Typography } from "@arco-design/web-react";
import { GetServerSidePropsContext } from "next";
import { SETTLED_TX_STATUSES, MERKLE_PAY_EXPIRE_TIME } from "src/utils/solana";

export default function PaymentStatusPage({
  status,
  mpid,
  error,
  needPolling,
}: {
  status: string | null;
  mpid: string | null;
  error: string | null;
  needPolling: boolean;
}) {
  return (
    <Space direction="vertical" size="medium" className={styles.container}>
      <Typography.Title>Payment Status</Typography.Title>
      <Typography.Text>Payment MPID: {mpid ?? "Not found"}</Typography.Text>
      {status && <Typography.Text>Payment Status: {status}</Typography.Text>}
      {error && <Typography.Text>{error}</Typography.Text>}
    </Space>
  );
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { mpid } = context.query;

  if (!mpid) {
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
    // not final, and not expired
    !SETTLED_TX_STATUSES.has(payment.status) &&
    new Date(payment.updatedAt).getTime() + MERKLE_PAY_EXPIRE_TIME > Date.now();

  return {
    props: {
      status: payment?.status,
      mpid,
      error: null,
      needPolling,
    },
  };
};
