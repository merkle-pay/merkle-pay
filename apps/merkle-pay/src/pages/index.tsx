import styles from "./index.module.scss";
import { LuNetwork } from "react-icons/lu";
import { FcFlashOn } from "react-icons/fc";
import { FcDataProtection } from "react-icons/fc";
import { Button, Space, Typography } from "@arco-design/web-react";
import { GiChemicalArrow } from "react-icons/gi";

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <Typography.Title className={styles.heroTitle}>
          The Future of Crypto Payments
        </Typography.Title>
        <Typography.Title heading={6} className={styles.heroSubtitle}>
          Fast, secure, and decentralized payments across multiple blockchains
        </Typography.Title>
        <Button
          size="large"
          type="primary"
          className={styles.ctaButton}
          href="/pay"
        >
          Get Started
          <GiChemicalArrow size={24} />
        </Button>
      </div>

      <Space direction="vertical" size={16} className={styles.features}>
        <Space direction="vertical" size={8} className={styles.feature}>
          <Space size={8} className={styles.featureTitle}>
            <LuNetwork size={32} className={styles.featureIcon} />
            <Typography.Title heading={3}>Multi-Chain Support</Typography.Title>
          </Space>
          <Typography.Paragraph>
            Process payments on Solana, Base, Sui, Polygon, Arbitrum One, and
            more with on-chain transaction records
          </Typography.Paragraph>
        </Space>

        <Space direction="vertical" size={8} className={styles.feature}>
          <Space size={8} className={styles.featureTitle}>
            <FcDataProtection size={32} className={styles.featureIcon} />
            <Typography.Title heading={3}>On-Chain Security</Typography.Title>
          </Space>
          <Typography.Paragraph>
            All transactions are permanently recorded on the blockchain for
            maximum transparency and verification
          </Typography.Paragraph>
        </Space>

        <Space direction="vertical" size={8} className={styles.feature}>
          <Space size={8} className={styles.featureTitle}>
            <FcFlashOn size={32} className={styles.featureIcon} />
            <Typography.Title heading={3}>Lightning Fast</Typography.Title>
          </Space>
          <Typography.Paragraph>
            Process transactions in milliseconds with minimal fees across all
            supported networks
          </Typography.Paragraph>
        </Space>
      </Space>
    </main>
  );
}
