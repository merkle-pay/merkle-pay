import { StableCoin } from "./currency";
import { z } from "zod";

import { PaymentStatus } from "./database";

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
  payer: z.string().optional(), // optional in the url, but required in the form
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

export const paymentFormDataSchema = z.object({
  recipient_address: z.string(),
  amount: z.number().positive(),
  token: z.string(),
  blockchain: z.string(),
  orderId: z.string(),
  returnUrl: z.string(),
  businessName: z.string(),
  payer: z.string(), // optional in the url, but required in the form
  message: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentFormDataSchema>;

export type PaymentState = {
  paymentFormData: PaymentFormData;
  businessName: string | undefined;
  tokenOptions: {
    [key in StableCoin["blockchain"]]?: string[];
  };
  blockchainOptions: string[];
  returnUrl: string;
  paymentFormUrl: string;
  paymentTableRecord: z.infer<typeof paymentTableRecordSchema> | null;
  urlForSolanaPayQrCode: string | null;
  referencePublicKeyString: string | null;
};

export type PaymentActions = {
  setPaymentFormData: (paymentFormData: PaymentFormData) => void;
  setPaymentFormUrl: (url: string) => void;
  setBusinessName: (name: string) => void;
  setTokenOptions: (options: {
    [key in StableCoin["blockchain"]]?: string[];
  }) => void;
  setBlockchainOptions: (options: string[]) => void;
  setReturnUrl: (url: string) => void;
  setPaymentTableRecord: (
    record: z.infer<typeof paymentTableRecordSchema> | null
  ) => void;
  setUrlForSolanaPayQrCode: (url: string | null) => void;
  setReferencePublicKeyString: (str: string | null) => void;
};

export type PaymentStore = PaymentState & PaymentActions;

export type ApiResponse<T> = {
  code: number;
  data: T | null;
  message: string;
};

export type PaymentStatusApiResponse = ApiResponse<{ status: PaymentStatus }>;

export const paymentTableRecordSchema = z.object({
  id: z.number(),
  recipient_address: z.string(),
  amount: z.number().positive(),
  token: z.string(),
  blockchain: z.string(),
  orderId: z.string(),
  returnUrl: z.string().or(z.null()).optional(),
  business_name: z.string(),
  payer_address: z.string().or(z.null()).optional(),
  referencePublicKey: z.string(),
  mpid: z.string(),
  raw: z.any(),
  txId: z.string().or(z.null()).optional(),
  status: z.nativeEnum(PaymentStatus),
  createdAt: z.string(),
});
