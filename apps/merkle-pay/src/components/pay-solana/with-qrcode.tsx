import React, { useRef, useState } from "react";

import styles from "./with-qrcode.module.scss";
import clsx from "clsx";
import { Button } from "@arco-design/web-react";
import QRCodeStyling from "@solana/qr-code-styling";

import { logoSvg } from "src/utils/logo";
import { createQROptions } from "@solana/pay";
import { paymentTableRecordSchema } from "src/types/payment";
import { z } from "zod";

export const WithSolanaPayQrCode = ({
  urlForSolanaPayQrCode,
  paymentTableRecord,
  setAlertMessage,
}: {
  urlForSolanaPayQrCode: string | null;
  paymentTableRecord: z.infer<typeof paymentTableRecordSchema> | null;
  setAlertMessage: (message: {
    type: "error" | "success" | "info" | null;
    value: React.ReactNode | null;
  }) => void;
}) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const generateQrCode = async () => {
    if (!urlForSolanaPayQrCode || !paymentTableRecord?.mpid) {
      setAlertMessage({
        type: "error",
        value: urlForSolanaPayQrCode
          ? "QR code not generated properly"
          : "Invalid payment record",
      });
      return;
    }

    const logoDataUri = `data:image/svg+xml;base64,${btoa(logoSvg)}`;
    const options = createQROptions(urlForSolanaPayQrCode, 300);
    options.image = logoDataUri;

    const qrCode = new QRCodeStyling(options);
    const currentRef = qrCodeRef.current;
    if (qrCode && currentRef) {
      currentRef.innerHTML = "";
      qrCode.append(currentRef);
    } else {
      setAlertMessage({
        type: "info",
        value: "QR code not appended properly",
      });
    }
  };

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
        id="solana-pay-qrcode"
        ref={qrCodeRef}
      />
    </>
  );
};
