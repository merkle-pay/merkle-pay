import {
  PaymentFormData,
  PaymentState,
  PaymentStore,
  paymentTableRecordSchema,
} from "../types/payment";

import { create } from "zustand";
import { RecipientWallet } from "../types/recipient";

import { z } from "zod";
import { StableCoin } from "src/types/currency";

const initialState: PaymentState = {
  // payment will be saved into the database
  paymentFormData: {
    recipient_address: "",
    amount: 0,
    token: "",
    blockchain: "",
    orderId: "",
    returnUrl: "/pay/status",
    businessName: "",
    payer: "",
    message: "",
  } satisfies PaymentFormData,
  solanaWallets: [], // configurable
  businessName: "", // configurable
  tokenOptions: {
    solana: [],
    tron: [],
  },
  blockchainOptions: [], // configurable
  returnUrl: "", // configurable
  paymentFormUrl: "",
  paymentTableRecord: null,
  urlForQrCode: null,
  referencePublicKeyString: null,
};

// Custom hook to use the context
export const usePaymentStore = create<PaymentStore>((set) => ({
  ...initialState,
  setPaymentFormData: (paymentFormData: PaymentFormData) =>
    set({ paymentFormData }),
  setPaymentFormUrl: (url: string) => set({ paymentFormUrl: url }),
  setSolanaWallets: (wallets: RecipientWallet[]) =>
    set({ solanaWallets: wallets }),
  setBusinessName: (name: string) => set({ businessName: name }),
  setTokenOptions: (options: {
    [key in StableCoin["blockchain"]]?: string[];
  }) => set({ tokenOptions: options }),
  setBlockchainOptions: (options: string[]) =>
    set({ blockchainOptions: options }),
  setReturnUrl: (url: string) => set({ returnUrl: url }),
  setPaymentTableRecord: (
    record: z.infer<typeof paymentTableRecordSchema> | null
  ) => set({ paymentTableRecord: record }),
  setUrlForQrCode: (url: string | null) => set({ urlForQrCode: url }),
  setReferencePublicKeyString: (str: string | null) =>
    set({ referencePublicKeyString: str }),
}));
