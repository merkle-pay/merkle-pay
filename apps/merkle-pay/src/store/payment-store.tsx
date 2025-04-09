import { Payment, PaymentState, PaymentStore } from "../../types/payment";

import { create } from "zustand";
import { RecipientWallet } from "../../types/recipient";

const initialState: PaymentState = {
  payment: {
    recipient_address: "",
    amount: 0,
    token: "",
    blockchain: "",
    orderId: "",
    returnUrl: "",
    appId: "",
    payer: "",
  } satisfies Payment,
  solanaWallets: [],
  appId: "",
  tokenOptions: [],
  backUrl: "",
};

// Custom hook to use the context
export const usePaymentStore = create<PaymentStore>((set) => ({
  ...initialState,
  setPayment: (payment: Payment) => set({ payment }),
  setBackUrl: (url: string) => set({ backUrl: url }),
  setSolanaWallets: (wallets: RecipientWallet[]) =>
    set({ solanaWallets: wallets }),
  setAppId: (id: string) => set({ appId: id }),
  setTokenOptions: (options: string[]) => set({ tokenOptions: options }),
}));
