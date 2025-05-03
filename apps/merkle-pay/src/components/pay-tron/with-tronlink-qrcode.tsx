import React, { useState } from "react";

import { Button, Space, Typography } from "@arco-design/web-react";
import { QRCodeSVG } from "qrcode.react";
import { usePaymentStore } from "src/store/payment-store";

export const WithTronLinkQrCode = ({
  setAlertMessage,
}: {
  setAlertMessage: (message: {
    type: "error" | "success" | "info" | null;
    value: React.ReactNode | null;
  }) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { paymentTableRecord } = usePaymentStore();

  if (!paymentTableRecord) {
    setAlertMessage({
      type: "error",
      value: "No payment table record found",
    });
    return null;
  }

  // TODO: cents trick
  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      <Button
        type="primary"
        size="large"
        long
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
      >
        Scan QR Code with TronLink
      </Button>

      <Space
        style={{
          display: isExpanded ? "flex" : "none",
        }}
        size={8}
        direction="horizontal"
      >
        <QRCodeSVG
          value={paymentTableRecord.recipient_address}
          size={256}
          level={"M"}
        />
        <Space direction="vertical" size={4}>
          <Typography.Title heading={5}>
            Please scan the QR code with TronLink to pay.
          </Typography.Title>
          <Typography.Title heading={5}>
            Please make sure the amount is
            <br />
            {`${paymentTableRecord.amount} ${paymentTableRecord.token}`}.
          </Typography.Title>
        </Space>
      </Space>
    </Space>
  );
};
