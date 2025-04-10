import { Button, Space, Typography } from "@arco-design/web-react";
import { usePaymentStore } from "../../../store/payment-store";
import { useRouter } from "next/router";

import styles from "./index.module.scss";

import { Keypair, PublicKey } from "@solana/web3.js";
import { encodeURL, createQR } from "@solana/pay";
import BigNumber from "bignumber.js";
import { useEffect, useRef, useState } from "react";
import { establishConnection, SplTokens } from "../../../../utils/solana";

export default function PaymentConfirmPage() {
  const { payment, paymentFormUrl } = usePaymentStore();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "success" | "error"
  >();
  const ref = useRef<HTMLDivElement>(null);

  const connection = establishConnection("mainnet-beta");

  //   amount
  // label
  // memo
  // message
  // recipient
  // reference
  // splToken

  //   const recipient = new PublicKey('MERCHANT_WALLET');
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
    if (ref.current) {
      // Clear previous QR code if any (optional, but good practice)
      ref.current.innerHTML = "";
      qrCode.append(ref.current);
    }
  }, [qrCode]); // Re-run if qrCode changes

  return (
    <Space direction="vertical" size={8} className={styles.container}>
      <Typography.Title className={styles.title}>
        Payment Confirmation
      </Typography.Title>
      <Typography.Title heading={6} className={styles.subtitle}>
        Please scan the QR code with your Phantom or Solflare wallet
      </Typography.Title>
      <div className={styles.qrCode} ref={ref} />
      <Button type="outline" onClick={() => router.push(paymentFormUrl)}>
        Back to Payment
      </Button>
    </Space>
  );
}
