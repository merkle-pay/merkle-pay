import "src/styles/globals.css";
import "@arco-design/web-react/dist/css/arco.css";
import type { AppProps } from "next/app";

import { Layout } from "src/components/layout";

export default function App({ Component, pageProps }: AppProps) {
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "";
  const BLOCKCHAIN_OPTIONS =
    process.env.NEXT_PUBLIC_BLOCKCHAIN_OPTIONS?.split(",") ?? [];
  const tokenOptions = {
    solana: process.env.NEXT_PUBLIC_SOLANA_TOKEN_OPTIONS?.split(",") ?? [],
    tron: process.env.NEXT_PUBLIC_TRON_TOKEN_OPTIONS?.split(",") ?? [],
  };
  const returnUrl = process.env.NEXT_PUBLIC_RETURN_URL ?? "";

  return (
    <Layout
      businessName={businessName}
      tokenOptions={tokenOptions}
      BLOCKCHAIN_OPTIONS={BLOCKCHAIN_OPTIONS}
      returnUrl={returnUrl}
    >
      <Component {...pageProps} />
    </Layout>
  );
}
