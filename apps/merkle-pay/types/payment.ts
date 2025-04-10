import { StableCoin } from "./currency";
import { z } from "zod";
import { RecipientWallet } from "./recipient";

export const payPageQuerySchema = z.object({
  blockchain: z
    .preprocess(
      // Handle string or string[] or undefined
      (val) => {
        if (typeof val === "string") return val;
        return undefined;
      },
      z.string().optional()
    )
    .default("solana"),
  token: z
    .preprocess((val) => {
      if (typeof val === "string") return val;
      return undefined;
    }, z.string().optional())
    .default("USDT"),
  recipient_address: z.string().optional(),
  amount: z.preprocess(
    // Convert to number if it's a string, handle arrays by taking first value
    (val) => {
      if (typeof val === "string") return Number(val);
      return undefined;
    },
    z.number()
  ),
  orderId: z.string(),
  payer: z.string().optional(),
  returnUrl: z.string(),
  businessName: z.string(),
});

export type PayPageQuery = z.infer<typeof payPageQuerySchema>;

export const paymentPreviewSchema = payPageQuerySchema.extend({
  sender: z.string(),
});

export type Order = {
  orderId: string;
  blockchain: string;
  payer_name: string;
  payer_email: string;
  receiver_address: string;
  crypto_currency: StableCoin; // only stable coin is supported for now
  crypto_amount: string;
  status:
    | "initiated"
    | "pending"
    | "paid"
    | "cancelled"
    | "refunded"
    | "failed";
  memo: string;
};

export type OrderStep =
  | "qrcode"
  | "warning"
  | "confirmation"
  | "paid"
  | "status";

// solana:
//        <recipient>?amount=<amount>
//       &spl-token=<spl-token>
//       &reference=<reference>
//       &label=<label>
//       &message=<message>
//       &memo=<memo></memo>

export const paymentSchema = z.object({
  recipient_address: z.string(),
  amount: z.number().positive(),
  token: z.string(),
  blockchain: z.string(),
  orderId: z.string(),
  returnUrl: z.string(),
  businessName: z.string(),
  payer: z.string(),
});

export type Payment = z.infer<typeof paymentSchema>;

export type PaymentState = {
  payment: Payment;
  solanaWallets: RecipientWallet[];
  businessName: string | undefined;
  tokenOptions: string[];
  backUrl: string;
};

export type PaymentActions = {
  setPayment: (payment: Payment) => void;
  setBackUrl: (url: string) => void;
  setSolanaWallets: (wallets: RecipientWallet[]) => void;
  setBusinessName: (name: string) => void;
  setTokenOptions: (options: string[]) => void;
};

export type PaymentStore = PaymentState & PaymentActions;
