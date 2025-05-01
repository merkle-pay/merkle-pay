export type RecipientWallet = {
  id: string;
  blockchain: "solana" | "ethereum" | "fogo" | "tron";
  address: string;
};
