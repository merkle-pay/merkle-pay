import { PayForm, PayFormProvider } from "../../components/pay-form";
import { RecipientWallet } from "../../types/recipient";

// solana:
//        <recipient>?amount=<amount>
//       &spl-token=<spl-token>
//       &reference=<reference>
//       &label=<label>
//       &message=<message>
//       &memo=<memo></memo>

// solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId12345

// Ethereum: ERC-681

// request                 = schema_prefix target_address [ "@" chain_id ] [ "/" function_name ] [ "?" parameters ]
// schema_prefix           = "ethereum" ":" [ "pay-" ]
// target_address          = ethereum_address
// chain_id                = 1*DIGIT
// function_name           = STRING
// ethereum_address        = ( "0x" 40*HEXDIG ) / ENS_NAME
// parameters              = parameter *( "&" parameter )
// parameter               = key "=" value
// key                     = "value" / "gas" / "gasLimit" / "gasPrice" / TYPE
// value                   = number / ethereum_address / STRING
// number                  = [ "-" / "+" ] *DIGIT [ "." 1*DIGIT ] [ ( "e" / "E" ) [ 1*DIGIT ] ]

export default function PayPage() {
  const BUSINESS_NAME_FROM_ENV = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? null;
  const SOLANA_WALLETS_PUBLIC_ENV =
    process.env.NEXT_PUBLIC_SOLANA_WALLETS?.split(",") ?? [];

  const SOLANA_WALLETS: RecipientWallet[] = SOLANA_WALLETS_PUBLIC_ENV.map(
    (wallet) => ({
      id: `solana-${wallet}`,
      address: wallet,
      blockchain: "solana",
    })
  );

  // Configuration for the payment store
  const tokenOptions = {
    solana: ["USDT", "USDC", "SOL"],
  };
  const blockchainOptions = ["solana"];
  const returnUrl = process.env.NEXT_PUBLIC_RETURN_URL ?? "/pay/status";

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Pay</h1>
      <PayFormProvider
        businessName={BUSINESS_NAME_FROM_ENV}
        returnUrl={returnUrl}
        tokenOptions={tokenOptions}
        blockchainOptions={blockchainOptions}
      >
        <PayForm
          businessNameFromEnv={BUSINESS_NAME_FROM_ENV}
          solanaWallets={SOLANA_WALLETS}
        />
      </PayFormProvider>
    </div>
  );
}
