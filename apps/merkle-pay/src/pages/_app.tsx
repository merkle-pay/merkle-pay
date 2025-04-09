import "src/styles/globals.css";
import "@arco-design/web-react/dist/css/arco.css";
import type { AppProps } from "next/app";
import { PaymentProvider } from "../context/PaymentContext";
import { RecipientWallet } from "../../types/recipient";
import { Layout } from "src/components/layout";

export default function App({ Component, pageProps }: AppProps) {
  const solanaWalletsPublicEnv =
    process.env.NEXT_PUBLIC_SOLANA?.split(",") ?? [];
  const solanaWallets: RecipientWallet[] = solanaWalletsPublicEnv.map(
    (wallet) => ({
      id: `solana-${wallet}`,
      address: wallet,
      blockchain: "solana",
    })
  );

  const appId = process.env.NEXT_PUBLIC_APP_ID;
  const tokenOptions = process.env.NEXT_PUBLIC_TOKEN_OPTIONS?.split(",") ?? [];
  return (
    <PaymentProvider
      solanaWallets={solanaWallets}
      appId={appId}
      tokenOptions={tokenOptions}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </PaymentProvider>
  );
}
