import { FiatCurrency } from "../types/currency";

export const FIAT_CURRENCIES = [
  {
    label: "USD (US Dollar)",
    value: "USD",
  },
  {
    label: "CAD (Canadian Dollar)",
    value: "CAD",
  },
  {
    label: "EUR (Euro)",
    value: "EUR",
  },
  {
    label: "CNY (Chinese Yuan)",
    value: "CNY",
  },
  {
    label: "KRW (South Korean Won)",
    value: "KRW",
  },
  {
    label: "JPY (Japanese Yen)",
    value: "JPY",
  },
  {
    label: "HKD (Hong Kong Dollar)",
    value: "HKD",
  },
  {
    label: "SGD (Singapore Dollar)",
    value: "SGD",
  },
  {
    label: "AUD (Australian Dollar)",
    value: "AUD",
  },
  {
    label: "GBP (British Pound)",
    value: "GBP",
  },
] as const satisfies Array<{ label: string; value: FiatCurrency }>;
