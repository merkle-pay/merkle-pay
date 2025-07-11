import {
  PaymentFormData,
  PaymentState,
  PaymentStore,
  paymentTableRecordSchema,
} from "../types/payment";

import { create } from "zustand";

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
  businessName: "", // configurable
  tokenOptions: {
    solana: [],
  },
  blockchainOptions: [], // configurable
  returnUrl: "", // configurable
  paymentFormUrl: "",
  paymentTableRecord: null,
  urlForSolanaPayQrCode: null,
  referencePublicKeyString: null,
};

// Custom hook to use the context
export const usePaymentStore = create<PaymentStore>((set) => ({
  ...initialState,
  setPaymentFormData: (paymentFormData: PaymentFormData) =>
    set({ paymentFormData }),
  setPaymentFormUrl: (url: string) => set({ paymentFormUrl: url }),
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
  setUrlForSolanaPayQrCode: (url: string | null) =>
    set({ urlForSolanaPayQrCode: url }),
  setReferencePublicKeyString: (str: string | null) =>
    set({ referencePublicKeyString: str }),
}));
