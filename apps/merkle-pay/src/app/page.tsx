import { LuNetwork } from "react-icons/lu";
import { FcFlashOn } from "react-icons/fc";
import { FcDataProtection } from "react-icons/fc";
import { Button } from "src/components/ui/button";
import { GiChemicalArrow } from "react-icons/gi";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center max-w-2xl mx-auto">
      <div className="w-full flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-center mb-4">
          The Future of Crypto Payments
        </h1>
        <h6 className="text-lg text-center text-muted-foreground mb-0">
          Fast, secure, and decentralized payments across multiple blockchains
        </h6>
        <Button
          size="lg"
          className="mt-8 px-5 py-2.5 w-fit flex items-center justify-center gap-2 font-semibold text-base"
          asChild
        >
          <Link href="/pay">
            Get Started
            <GiChemicalArrow size={24} className="-rotate-90" />
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-2xl mt-8 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <LuNetwork
              size={32}
              className="flex items-center justify-center text-blue-500"
            />
            <h3 className="text-2xl font-semibold m-0">Multi-Chain Support</h3>
          </div>
          <p className="text-muted-foreground">
            Process payments on Solana, Base, Sui, Polygon, Arbitrum One, and
            more with on-chain transaction records
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FcDataProtection
              size={32}
              className="flex items-center justify-center"
            />
            <h3 className="text-2xl font-semibold m-0">On-Chain Security</h3>
          </div>
          <p className="text-muted-foreground">
            All transactions are permanently recorded on the blockchain for
            maximum transparency and verification
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FcFlashOn size={32} className="flex items-center justify-center" />
            <h3 className="text-2xl font-semibold m-0">Lightning Fast</h3>
          </div>
          <p className="text-muted-foreground">
            Process transactions in milliseconds with minimal fees across all
            supported networks
          </p>
        </div>
      </div>
    </main>
  );
}
