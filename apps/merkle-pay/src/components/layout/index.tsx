import styles from "./index.module.scss";
import {
  Layout as ArcoLayout,
  Typography,
  Link as ArcoLink,
} from "@arco-design/web-react";
import { RecipientWallet } from "../../types/recipient";
import { useEffect } from "react";
import { usePaymentStore } from "src/store/payment-store";
import Image from "next/image";
import NextLink from "next/link";

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
        <NextLink href="/" className={styles.stylelessLink}>
          <Image src="/logo.png" alt="logo" width={64} height={64} />
        </NextLink>
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
          <ArcoLink href="https://merklepay.io" target="_blank">
            Merkle Pay
          </ArcoLink>
        </Typography.Title>
        <Typography.Paragraph>
          © 2025 Merkle Pay. All rights reserved.
        </Typography.Paragraph>
      </ArcoLayout.Footer>
    </ArcoLayout>
  );
};
