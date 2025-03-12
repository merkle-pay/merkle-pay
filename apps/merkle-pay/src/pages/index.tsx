import { Link } from "react-aria-components";

export default function Home() {
  return (
    <div className="flex flex-col">
      <h1>Merkle Pay</h1>
      <p>
        Merkle Pay is a payment protocol for the blockchain. It allows users to
        send and receive payments using stablecoins, such as USDC and USDT.
      </p>
      <Link href="/pay">Pay</Link>
    </div>
  );
}
