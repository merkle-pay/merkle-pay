import { Payment, PaymentState, PaymentStore } from "../types/payment";

import { create } from "zustand";
import { RecipientWallet } from "../types/recipient";

const initialState: PaymentState = {
  // payment will be saved into the database
  payment: {
    recipient_address: "",
    amount: 0,
    token: "",
    blockchain: "",
    orderId: "",
    returnUrl: "/pay/status",
    businessName: "",
    payer: "",
    message: "",
  } satisfies Payment,
  solanaWallets: [], // configurable
  businessName: "", // configurable
  tokenOptions: [], // configurable
  returnUrl: "", // configurable
  paymentFormUrl: "",
};

// Custom hook to use the context
export const usePaymentStore = create<PaymentStore>((set) => ({
  ...initialState,
  setPayment: (payment: Payment) => set({ payment }),
  setPaymentFormUrl: (url: string) => set({ paymentFormUrl: url }),
  setSolanaWallets: (wallets: RecipientWallet[]) =>
    set({ solanaWallets: wallets }),
  setBusinessName: (name: string) => set({ businessName: name }),
  setTokenOptions: (options: string[]) => set({ tokenOptions: options }),
  setReturnUrl: (url: string) => set({ returnUrl: url }),
}));
