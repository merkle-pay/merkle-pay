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
  blockchain: string;
};

export interface StableCoin extends CryptoCurrency {
  name: "USDC" | "USDT";
  symbol: "USDC" | "USDT";
  logo: string;
  blockchain: "solana" | "ethereum" | "bitcoin" | "tron" | "fogo";
}

export type Blockchain = StableCoin["blockchain"];
