import { TronWeb } from "tronweb";

export const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: { "TRON-PRO-API-KEY": process.env.NEXT_PUBLIC_TRON_GRID_API_KEY },
});
