import { createQROptions } from "@solana/pay";
import { renderToString } from "react-dom/server";

import { useEffect, useMemo, useRef, useState } from "react";
import { logoSvg } from "../utils/logo";
import QRCodeStyling from "@solana/qr-code-styling";
import { createPaymentService } from "src/services/payment";
import { Payment } from "src/types/payment";
import { IconSync } from "@arco-design/web-react/icon";

export const useSolanaQR = ({ payment }: { payment: Payment }) => {
  const [paymentRecord, setPaymentRecord] = useState<{
    mpid: string | null;
    urlForQrCode: string | null;
  }>({
    mpid: null,
    urlForQrCode: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      const createPaymentTableRecord = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Replace with your actual API call
          const { data, error } = await createPaymentService(payment);
          if (error || !data) {
            setError(error);
            return;
          }

          setPaymentRecord(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setPaymentRecord({
            mpid: null,
            urlForQrCode: null,
          });
        } finally {
          setIsLoading(false);
        }
      };
      createPaymentTableRecord();
    }

    return () => {
      effectRan.current = true;
    };
  }, [payment]);

  const qrCodeRef = useRef<HTMLDivElement>(null);
  const qrCode = useMemo(() => {
    if (!paymentRecord.mpid || !paymentRecord.urlForQrCode) {
      return null;
    }

    try {
      // Generate the URL using the reference string provided by the backend

      const logoDataUri = `data:image/svg+xml;base64,${btoa(logoSvg)}`;

      const options = createQROptions(paymentRecord.urlForQrCode, 300);
      options.image = logoDataUri;

      return new QRCodeStyling(options);
    } catch (error) {
      console.error("Error generating Solana Pay URL or QR options:", error);
      // Handle potential errors, e.g., invalid public key strings
      return null;
    }
  }, [paymentRecord.mpid, paymentRecord.urlForQrCode]);

  // Use useEffect to append the QR code after the component mounts
  useEffect(() => {
    const currentRef = qrCodeRef.current;
    if (qrCode && currentRef) {
      // Append the QR code
      currentRef.innerHTML = ""; // Clear previous QR code if any
      qrCode.append(currentRef);

      return () => {
        if (currentRef) {
          currentRef.innerHTML = "";
        }
      };
    } else if (currentRef) {
      if (isLoading) {
        currentRef.innerHTML = renderToString(
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "300px",
              height: "300px",
            }}
          >
            <IconSync spin style={{ fontSize: "36px" }} />
          </div>
        );
      }

      if (error) {
        currentRef.innerHTML = renderToString(
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "300px",
              height: "300px",
            }}
          >
            Error: {error}
          </div>
        );
      }
    }

    return () => {};
  }, [qrCode, isLoading, error]);

  // Return only the ref needed for rendering the QR code
  // The component calling this hook already has the payment details (including reference)
  return { qrCodeRef, paymentRecord, isLoading, error };
};
