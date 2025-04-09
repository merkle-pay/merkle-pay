import styles from "./index.module.scss";
import { Layout as ArcoLayout } from "@arco-design/web-react";

export const Layout = ({ children }: { children: React.ReactNode }) => {
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
