// {
//     "id": "7fb769c6-f723-44d4-ba09-bd3b117742b3",
//     "success": true,
//     "data": {
//       "So11111111111111111111111111111111111111112": "239.02618235836016"
//     }
// }
// "https://api-v3.raydium.io/mint/price?mints=So11111111111111111111111111111111111111112"

import { NativeSolanaToken } from "./solana";

// sol price in USDT
export const solRealTimePrice = async (): Promise<number | null> => {
  const response = await fetch(
    `https://api-v3.raydium.io/mint/price?mints=${NativeSolanaToken.mint}`
  );
  const json = await response.json();
  return json.success ? json.data[NativeSolanaToken.mint] : null;
};
