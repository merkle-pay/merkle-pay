import React, { useState } from "react";

import styles from "./with-qrcode.module.scss";
import clsx from "clsx";
import { Button, Space, Typography } from "@arco-design/web-react";

export const WithQRCode = ({
  qrCodeRef,
}: {
  qrCodeRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Space direction="vertical" size={8}>
      <Button type="primary" long onClick={() => setIsExpanded(!isExpanded)}>
        <Typography.Title heading={5}>Scan QR Code</Typography.Title>
      </Button>

      <Space direction="vertical" size={4}>
        <div
          className={clsx(styles.qrCodeContainer, {
            [styles.expanded]: isExpanded,
          })}
        >
          <div id="qr-code-container" ref={qrCodeRef} />
          <Typography.Text type="secondary">
            Open your banking app and scan this QR code to complete the payment
          </Typography.Text>
        </div>
      </Space>
    </Space>
  );
};
