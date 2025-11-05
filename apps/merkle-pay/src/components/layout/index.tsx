import styles from "./index.module.scss";
import { useEffect } from "react";
import { usePaymentStore } from "src/store/payment-store";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

// ! All props are from env variables
export const Layout = ({
  children,
  businessName: businessNameFromEnv,
  tokenOptions,
  BLOCKCHAIN_OPTIONS,
  returnUrl: returnUrlFromEnv,
}: {
  children: React.ReactNode;

  businessName: string;
  tokenOptions: {
    solana: string[];
  };
  BLOCKCHAIN_OPTIONS: string[];
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
    setBlockchainOptions(BLOCKCHAIN_OPTIONS);
    setReturnUrl(returnUrlFromUrl || returnUrlFromEnv || "/pay/status");
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link href="/" className={styles.stylelessLink}>
          <Image src="/logo.png" alt="logo" width={64} height={64} />
        </Link>
        <h5 className={styles.title}>
          {businessNameFromEnv || businessNameFromUrl || "Merkle Pay"}
        </h5>
      </header>
      <main className={styles.content}>
        {children}
      </main>
      <footer className={styles.footer}>
        <h5>
          Powered by{" "}
          <a href="https://merklepay.com" target="_blank" rel="noopener noreferrer">
            Merkle Pay
          </a>
        </h5>
        <p>
          © 2025 Merkle Pay. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
