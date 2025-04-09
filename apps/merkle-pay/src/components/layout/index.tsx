import styles from "./index.module.scss";
import { Layout as ArcoLayout } from "@arco-design/web-react";
import { RecipientWallet } from "../../../types/recipient";
import { useEffect } from "react";
import { usePaymentStore } from "src/store/payment-store";

export const Layout = ({
  children,
  solanaWallets,
  appId,
  tokenOptions,
}: {
  children: React.ReactNode;
  solanaWallets: RecipientWallet[];
  appId: string;
  tokenOptions: string[];
}) => {
  const { setSolanaWallets, setAppId, setTokenOptions } = usePaymentStore();

  useEffect(() => {
    setSolanaWallets(solanaWallets);
    setAppId(appId);
    setTokenOptions(tokenOptions);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ArcoLayout className={styles.layout}>
      <ArcoLayout.Header className={styles.header}>
        <h1 className={styles.title}>Merkle Pay TODO</h1>
      </ArcoLayout.Header>
      <ArcoLayout.Content className={styles.content}>
        {children}
      </ArcoLayout.Content>
    </ArcoLayout>
  );
};
