"use client";

import { useEffect, PropsWithChildren } from "react";
import { usePaymentStore } from "../../store/payment-store";

interface PayFormProviderProps {
  businessName: string | null;
  returnUrl: string;
  tokenOptions: Record<string, string[]>;
  blockchainOptions: string[];
}

export function PayFormProvider({
  children,
  businessName,
  returnUrl,
  tokenOptions,
  blockchainOptions,
}: PropsWithChildren<PayFormProviderProps>) {
  const {
    setBusinessName,
    setReturnUrl,
    setTokenOptions,
    setBlockchainOptions,
  } = usePaymentStore();

  useEffect(() => {
    if (businessName) {
      setBusinessName(businessName);
    }
    setReturnUrl(returnUrl);
    setTokenOptions(tokenOptions);
    setBlockchainOptions(blockchainOptions);
  }, [
    businessName,
    returnUrl,
    tokenOptions,
    blockchainOptions,
    setBusinessName,
    setReturnUrl,
    setTokenOptions,
    setBlockchainOptions,
  ]);

  return <>{children}</>;
}
