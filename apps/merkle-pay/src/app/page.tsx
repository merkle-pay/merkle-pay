import { LuNetwork, LuShield, LuUsers, LuGlobe, LuMail } from "react-icons/lu";
import { FcFlashOn } from "react-icons/fc";
import { FcDataProtection } from "react-icons/fc";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { Separator } from "src/components/ui/separator";
import { GiChemicalArrow } from "react-icons/gi";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/logo.svg"
                alt="Merkle Pay Logo"
                width={120}
                height={120}
                className="h-24 w-24 md:h-32 md:w-32"
              />
            </div>

            {/* Hero Title */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              The Future of{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Crypto Payments
              </span>
            </h1>

            {/* Hero Subtitle */}
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Fast, secure, and decentralized payments across multiple
              blockchains. Experience the next generation of financial
              transactions with unmatched speed and security.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold"
                asChild
              >
                <Link href="/pay" className="flex items-center gap-2">
                  Get Started Now
                  <GiChemicalArrow size={24} className="-rotate-90" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-lg font-semibold"
                asChild
              >
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]">
            <div className="aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why Choose Merkle Pay?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Built for the future of digital payments with cutting-edge
              blockchain technology
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <LuNetwork className="mb-2 h-12 w-12 text-blue-500" />
                <CardTitle className="text-xl">Multi-Chain Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Process payments on Solana, Base, Sui, Polygon, Arbitrum One,
                  and more with seamless cross-chain compatibility and on-chain
                  transaction records.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <FcDataProtection className="mb-2 h-12 w-12" />
                <CardTitle className="text-xl">On-Chain Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  All transactions are permanently recorded on the blockchain
                  for maximum transparency, immutability, and verifiable
                  security.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <FcFlashOn className="mb-2 h-12 w-12" />
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Process transactions in milliseconds with minimal fees across
                  all supported networks. Experience the speed of modern
                  blockchain technology.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <LuShield className="mb-2 h-12 w-12 text-green-500" />
                <CardTitle className="text-xl">Enterprise Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Built for businesses with enterprise-grade security,
                  compliance, and scalability to handle millions of
                  transactions.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <LuGlobe className="mb-2 h-12 w-12 text-purple-500" />
                <CardTitle className="text-xl">Global Reach</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Accept payments from anywhere in the world with instant
                  settlement and no geographical restrictions.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="group hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <LuUsers className="mb-2 h-12 w-12 text-orange-500" />
                <CardTitle className="text-xl">Developer Friendly</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Simple APIs and SDKs for seamless integration into your
                  applications with comprehensive documentation and support.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center md:p-12">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Transform Your Payments?
              </h2>
              <p className="mb-8 text-lg text-blue-100">
                Join thousands of businesses already using Merkle Pay to process
                secure, fast, and reliable cryptocurrency payments.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-lg font-semibold"
                asChild
              >
                <Link href="/pay" className="flex items-center gap-2">
                  Start Processing Payments
                  <GiChemicalArrow size={24} className="-rotate-90" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="Merkle Pay Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <span className="text-lg font-semibold">Merkle Pay</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The future of cryptocurrency payments. Fast, secure, and
                decentralized transactions across multiple blockchains.
              </p>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="/pay"
                    className="hover:text-foreground transition-colors"
                  >
                    Payment Processing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Supported Blockchains
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Press
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              © 2025 Merkle Pay. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LuMail className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <LuGlobe className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
