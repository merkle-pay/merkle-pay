import { createQROptions } from "@solana/pay";

import { useEffect, useMemo, useRef, useState } from "react";
import { logoSvg } from "../utils/logo";
import QRCodeStyling from "@solana/qr-code-styling";
import { createPaymentQuery } from "src/queries/payment";
import { Payment } from "src/types/payment";
import { AntibotToken } from "src/types/antibot";
import { PaymentTableRecord } from "src/utils/prisma";

export const useSolanaQR = ({
  payment,
  antibotToken,
}: {
  payment: Payment;
  antibotToken: AntibotToken;
}) => {
  const [paymentRecord, setPaymentRecord] = useState<
    Pick<
      PaymentTableRecord,
      | "id"
      | "mpid"
      | "orderId"
      | "referencePublicKey"
      | "recipient_address"
      | "amount"
      | "token"
      | "blockchain"
    > & {
      urlForQrCode: string | null;
      returnUrl: string;
    }
  >({
    id: 0,
    mpid: "",
    orderId: "",
    urlForQrCode: null,
    referencePublicKey: "",
    recipient_address: "",
    amount: 0,
    token: "",
    blockchain: "",
    returnUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current === false) {
      const createPaymentTableRecord = async () => {
        if (!antibotToken.isInitialized) {
          return;
        }

        if (antibotToken.error) {
          setError(antibotToken.error);
          return;
        }

        if (antibotToken.isExpired) {
          setError("Turnstile token expired");
          return;
        }

        if (!antibotToken.token) {
          setError("Turnstile token missing");
          return;
        }

        if (
          payment.amount <= 0 ||
          !payment.blockchain ||
          !payment.token ||
          !payment.businessName ||
          !payment.recipient_address ||
          !payment.payer ||
          !payment.orderId ||
          !payment.returnUrl
        ) {
          setError("Invalid payment");
          return;
        }

        setIsLoading(true);
        setError(null);

        try {
          // Replace with your actual API call
          const { data, error } = await createPaymentQuery(
            payment,
            antibotToken.token
          );
          if (error || !data) {
            setError(error);
            return;
          }

          // ! potential issue here, if the data is any
          setPaymentRecord({ ...data, returnUrl: payment.returnUrl });
        } catch (err) {
          setError(err instanceof Error ? err.message : "Unknown error");
          setPaymentRecord({
            id: 0,
            mpid: "",
            orderId: "",
            urlForQrCode: null,
            referencePublicKey: "",
            recipient_address: "",
            amount: 0,
            token: "",
            blockchain: "",
            returnUrl: "",
          });
        } finally {
          setIsLoading(false);
        }
      };
      createPaymentTableRecord();
    }

    return () => {
      if (antibotToken.isExpired || antibotToken.error || !antibotToken.token) {
        return;
      }
      effectRan.current = true;
    };
  }, [
    payment,
    antibotToken.token,
    antibotToken.error,
    antibotToken.isExpired,
    antibotToken.isInitialized,
  ]);

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
        currentRef.innerHTML = "";
      };
    }

    return () => {};
  }, [qrCode, isLoading, error]);

  // Return only the ref needed for rendering the QR code
  // The component calling this hook already has the payment details (including reference)
  return {
    qrCodeRef,
    paymentRecord,
    isLoading,
    error,
  };
};
