import { Keypair, PublicKey } from "@solana/web3.js";
import { encodeURL, createQR } from "@solana/pay";
import BigNumber from "bignumber.js";
import { Payment } from "../types/payment";
import { establishConnection, SplTokens } from "../utils/solana";
import { useEffect, useRef } from "react";

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
  const url = encodeURL({
    recipient: new PublicKey(payment.recipient_address),
    amount: new BigNumber(payment.amount),
    reference: new Keypair().publicKey,
    label: payment.businessName,
    memo: payment.orderId,
    splToken: new PublicKey(SplTokens[payment.token as keyof typeof SplTokens]),
  });

  const qrCode = createQR(url, 300);

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
