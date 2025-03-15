export type FiatCurrency =
  | "USD"
  | "CAD"
  | "EUR"
  | "CNY"
  | "KRW"
  | "JPY"
  | "HKD"
  | "SGD"
  | "AUD"
  | "GBP";

export type CryptoCurrency = {
  name: string;
  symbol: string;
  logo: string;
  chain: string;
};

export interface StableCoin extends CryptoCurrency {
  name: "USDC" | "USDT";
  symbol: "USDC" | "USDT";
  logo: string;
  chain: "solana" | "ethereum" | "bitcoin" | "tron" | "fogo";
}
