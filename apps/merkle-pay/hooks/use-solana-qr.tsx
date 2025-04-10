import { Keypair, PublicKey } from "@solana/web3.js";
import { encodeURL, createQROptions } from "@solana/pay";
import BigNumber from "bignumber.js";
import { Payment } from "../types/payment";
import { establishConnection, SplTokens } from "../utils/solana";
import { useEffect, useMemo, useRef } from "react";
import { logoSvg } from "../utils/logo";
import QRCodeStyling from "@solana/qr-code-styling";

export const useSolanaQR = (payment: Payment) => {
  const connection = establishConnection("mainnet-beta");
  const qrCodeRef = useRef<HTMLDivElement>(null);

  // amount
  // label
  // memo
  // message
  // recipient
  // reference
  // splToken

  // const recipient = new PublicKey('MERCHANT_WALLET');
  // const amount = new BigNumber(20);
  // const reference = new Keypair().publicKey;
  // const label = 'Jungle Cats store';
  // const message = 'Jungle Cats store - your order - #001234';
  // const memo = 'JC#4098';

  const qrCode = useMemo(() => {
    const url = encodeURL({
      recipient: new PublicKey(payment.recipient_address),
      amount: new BigNumber(payment.amount),
      reference: new Keypair().publicKey,
      label: payment.businessName,
      memo: payment.orderId,
      message: payment.message,
      splToken: new PublicKey(
        SplTokens[payment.token as keyof typeof SplTokens]
      ),
    });

    const logoDataUri = `data:image/svg+xml;base64,${btoa(logoSvg)}`;

    const options = createQROptions(url, 300);
    options.image = logoDataUri;

    return new QRCodeStyling(options);
  }, [payment]);

  // Use useEffect to append the QR code after the component mounts
  useEffect(() => {
    const currentRef = qrCodeRef.current; // Capture ref value for cleanup
    if (qrCode && currentRef) {
      currentRef.innerHTML = ""; // Clear previous QR code
      qrCode.append(currentRef);

      // Cleanup function to remove the QR code when the component unmounts
      // or when qrCode changes (before the new one is appended)
      return () => {
        if (currentRef) {
          currentRef.innerHTML = "";
        }
      };
    }
    // Return an empty cleanup if no QR code was appended
    return () => {};
  }, [qrCode]); // Re-run if qrCode changes

  return { connection, qrCodeRef };
};
