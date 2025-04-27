import { paymentTableRecordSchema } from "src/types/payment";
import { z } from "zod";

type PhantomConnectCallbackParams = {
  dAppPublicKey: string;
  paymentTableRecord: z.infer<typeof paymentTableRecordSchema>;
  expiry: number;
};

export const ls = {
  get: (key: string) => {
    return window.localStorage.getItem(key);
  },
  set: (key: string, value: string) => {
    window.localStorage.setItem(key, value);
  },
  remove: (key: string) => {
    window.localStorage.removeItem(key);
  },
  clear: () => {
    window.localStorage.clear();
  },
  setPhantomConnectCallbackParams: (params: PhantomConnectCallbackParams) => {
    ls.set(LS_KEYS.PHANTOM_CONNECT_CALLBACK_PARAMS, JSON.stringify(params));
  },
  getPhantomConnectCallbackParams: (): PhantomConnectCallbackParams | null => {
    const params = ls.get(LS_KEYS.PHANTOM_CONNECT_CALLBACK_PARAMS);
    return params ? JSON.parse(params) : null;
  },
};

export const LS_KEYS = {
  PHANTOM_CONNECT_CALLBACK_PARAMS: "MerklePay.PhantomConnectCallbackParams",
  PHANTOM_UNIVERSAL_LINK_PARAMS: "MerklePay.PhantomUniversalLinkParams",
};
