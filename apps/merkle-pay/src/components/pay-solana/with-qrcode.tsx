import React, { useState } from "react";

import styles from "./with-qrcode.module.scss";
import clsx from "clsx";
import { Button } from "@arco-design/web-react";

export const WithQRCode = ({
  qrCodeRef,
  generateQrCode,
}: {
  qrCodeRef: React.RefObject<HTMLDivElement | null>;
  generateQrCode: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <Button
        type="primary"
        size="large"
        long
        onClick={() => {
          generateQrCode();
          setIsExpanded(!isExpanded);
        }}
      >
        Scan QR Code with Phantom or Solflare wallet
      </Button>

      <div
        className={clsx(styles.qrCodeContainer, {
          [styles.expanded]: isExpanded,
        })}
        id="qr-code-container"
        ref={qrCodeRef}
      />
    </>
  );
};
