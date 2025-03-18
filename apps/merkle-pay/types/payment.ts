import { StableCoin } from "./currency";

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
