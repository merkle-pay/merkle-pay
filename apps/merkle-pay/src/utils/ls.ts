import { paymentTableRecordSchema } from "src/types/payment";
import { z } from "zod";
import { PhantomConnectCallbackData } from "./phantom";

type PhantomConnectCallbackParams = {
  dAppPublicKey: string;
  paymentTableRecord: z.infer<typeof paymentTableRecordSchema>;
  expiry: number;
};

type PhantomUniversalLinkParams = PhantomConnectCallbackParams & {
  decryptedConnectCallbackData: PhantomConnectCallbackData;
  DAPP_PRIVATE_KEY_BASE58: string;
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
  setPhantomUniversalLinkParams: (params: PhantomUniversalLinkParams) => {
    ls.set(LS_KEYS.PHANTOM_UNIVERSAL_LINK_PARAMS, JSON.stringify(params));
  },
  getPhantomUniversalLinkParams: (): PhantomUniversalLinkParams | null => {
    const params = ls.get(LS_KEYS.PHANTOM_UNIVERSAL_LINK_PARAMS);
    return params ? JSON.parse(params) : null;
  },
};

export const LS_KEYS = {
  PHANTOM_CONNECT_CALLBACK_PARAMS: "MerklePay.PhantomConnectCallbackParams",
  PHANTOM_UNIVERSAL_LINK_PARAMS: "MerklePay.PhantomUniversalLinkParams",
};
