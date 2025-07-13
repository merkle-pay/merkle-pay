import "./globals.css";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { cn } from "src/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Merkle Pay: The Future of Crypto Payments",
  description:
    "Fast, secure, and decentralized payments across multiple blockchains",
  applicationName: "Merkle Pay",
  keywords: [
    "Merkle Pay",
    "Merkle Pay: Fast, secure, and decentralized payments across multiple blockchains",
    "Merkle Pay: The Future of Crypto Payments",
  ],
};

type Props = Readonly<{
  children: React.ReactNode;
}>;

export default async function RootLayout({ children }: Props) {
  return (
    <html>
      <body
        className={cn(
          inter.className,
          "flex flex-col h-screen min-h-screen w-screen justify-between"
        )}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
