import { TronWeb } from "tronweb";

export const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.NEXT_PUBLIC_TRON_GRID_API_KEY },
});

export const tronWebProvider = window.tronWeb;

export const TRON_TRC20_TOKENS = {
  USDT: {
    address: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    decimals: 6,
  },
  USDD: {
    address: "TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn",
    decimals: 6,
  },
};

export type TronTrc20Token = keyof typeof TRON_TRC20_TOKENS;
