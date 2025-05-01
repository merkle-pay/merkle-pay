import "src/styles/globals.css";
import "@arco-design/web-react/dist/css/arco.css";
import type { AppProps } from "next/app";

import { RecipientWallet } from "../types/recipient";
import { Layout } from "src/components/layout";

export default function App({ Component, pageProps }: AppProps) {
  const solanaWalletsPublicEnv =
    process.env.NEXT_PUBLIC_SOLANA_WALLETS?.split(",") ?? [];
  const solanaWallets: RecipientWallet[] = solanaWalletsPublicEnv.map(
    (wallet) => ({
      id: `solana-${wallet}`,
      address: wallet,
      blockchain: "solana",
    })
  );

  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "";
  const blockchainOptions =
    process.env.NEXT_PUBLIC_BLOCKCHAIN_OPTIONS?.split(",") ?? [];
  const tokenOptions = {
    solana: process.env.NEXT_PUBLIC_SOLANA_TOKEN_OPTIONS?.split(",") ?? [],
    tron: process.env.NEXT_PUBLIC_TRON_TOKEN_OPTIONS?.split(",") ?? [],
  };
  const returnUrl = process.env.NEXT_PUBLIC_RETURN_URL ?? "";

  return (
    <Layout
      solanaWallets={solanaWallets}
      businessName={businessName}
      tokenOptions={tokenOptions}
      blockchainOptions={blockchainOptions}
      returnUrl={returnUrl}
    >
      <Component {...pageProps} />
    </Layout>
  );
}
