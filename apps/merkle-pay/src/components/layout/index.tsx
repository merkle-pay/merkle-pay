import styles from "./index.module.scss";
import { Layout as ArcoLayout, Link, Typography } from "@arco-design/web-react";
import { RecipientWallet } from "../../../types/recipient";
import { useEffect } from "react";
import { usePaymentStore } from "src/store/payment-store";
import Image from "next/image";
export const Layout = ({
  children,
  solanaWallets,
  businessName,
  tokenOptions,
  returnUrl,
}: {
  children: React.ReactNode;
  solanaWallets: RecipientWallet[];
  businessName: string;
  tokenOptions: string[];
  returnUrl: string;
}) => {
  const { setSolanaWallets, setBusinessName, setTokenOptions, setReturnUrl } =
    usePaymentStore();

  useEffect(() => {
    setSolanaWallets(solanaWallets);
    setBusinessName(businessName);
    setTokenOptions(tokenOptions);
    setReturnUrl(returnUrl);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ArcoLayout className={styles.layout}>
      <ArcoLayout.Header className={styles.header}>
        <Image src="/logo.png" alt="logo" width={32} height={32} />
        <Typography.Title heading={5} className={styles.title}>
          Merkle Pay
        </Typography.Title>
      </ArcoLayout.Header>
      <ArcoLayout.Content className={styles.content}>
        {children}
      </ArcoLayout.Content>
      <ArcoLayout.Footer className={styles.footer}>
        <Typography.Title heading={5}>
          Powered by{" "}
          <Link href="https://merklepay.io" target="_blank">
            Merkle Pay
          </Link>
        </Typography.Title>
      </ArcoLayout.Footer>
    </ArcoLayout>
  );
};
