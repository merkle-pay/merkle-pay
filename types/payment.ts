import { FiatCurrency, StableCoin } from "./currency";

export type Order = {
  orderId: string;
  blockchain: string;
  receiver_address: string;
  payer_name: string;
  payer_email: string;
  stable_coin: StableCoin;
  stable_coin_amount: string;
  fiat_currency: FiatCurrency;
  fiat_amount: string;
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
