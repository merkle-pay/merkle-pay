export type RecipientWallet = {
  id: string;
  blockchain: "solana" | "ethereum" | "fogo";
  address: string;
};
