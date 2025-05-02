import { Space } from "@arco-design/web-react";
import { WithTronLink } from "./with-tronlink";

export const TronPaymentMethods = ({
  setAlertMessage,
}: {
  setAlertMessage: (error: {
    type: "error" | "success" | "info" | null;
    value: string | null;
  }) => void;
}) => {
  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <WithTronLink setAlertMessage={setAlertMessage} />
    </Space>
  );
};
