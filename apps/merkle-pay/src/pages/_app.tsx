import "src/styles/globals.css";
import type { AppProps } from "next/app";
import { PaymentProvider } from "../context/PaymentContext";
import { RecipientWallet } from "../../types/recipient";

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

  return (
    <PaymentProvider solanaWallets={solanaWallets}>
      <Component {...pageProps} />
    </PaymentProvider>
  );
}
