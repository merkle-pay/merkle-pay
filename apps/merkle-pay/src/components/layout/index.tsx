import styles from "./index.module.scss";
import {
  Layout as ArcoLayout,
  Typography,
  Link as ArcoLink,
} from "@arco-design/web-react";

import { useEffect } from "react";
import { usePaymentStore } from "src/store/payment-store";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";

// ! All props are from env variables
export const Layout = ({
  children,
  businessName: businessNameFromEnv,
  tokenOptions,
  blockchainOptions,
  returnUrl: returnUrlFromEnv,
}: {
  children: React.ReactNode;

  businessName: string;
  tokenOptions: {
    solana: string[];
    tron: string[];
  };
  blockchainOptions: string[];
  returnUrl: string;
}) => {
  const router = useRouter();
  const returnUrlFromUrl = router.query.returnUrl as string;
  const businessNameFromUrl = router.query.businessName as string;

  const {
    setBusinessName,
    setTokenOptions,
    setBlockchainOptions,
    setReturnUrl,
  } = usePaymentStore();

  useEffect(() => {
    if (!router.isReady) return;
    setBusinessName(businessNameFromEnv || businessNameFromUrl);
    setTokenOptions(tokenOptions);
    setBlockchainOptions(blockchainOptions);
    setReturnUrl(returnUrlFromUrl || returnUrlFromEnv || "/pay/status");
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ArcoLayout className={styles.layout}>
      <ArcoLayout.Header className={styles.header}>
        <NextLink href="/" className={styles.stylelessLink}>
          <Image src="/logo.png" alt="logo" width={64} height={64} />
        </NextLink>
        <Typography.Title heading={5} className={styles.title}>
          {businessNameFromEnv || businessNameFromUrl || "Merkle Pay"}
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
