import React, { createContext, useContext, useState, ReactNode } from "react";
import { Payment, PaymentContextValue } from "../../types/payment";
import { RecipientWallet } from "../../types/recipient";

// Create the context with default values
const PaymentContext = createContext<PaymentContextValue>({
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
  setPayment: () => {},
  solanaWallets: [],
  appId: "",
  tokenOptions: [],
});

// Custom hook to use the context
export const usePaymentContext = () => useContext(PaymentContext);

// Provider component to wrap your pages
export const PaymentProvider = ({
  children,
  solanaWallets,
  appId,
  tokenOptions,
}: {
  children: ReactNode;
  solanaWallets: RecipientWallet[];
  appId: string | undefined;
  tokenOptions: string[];
}) => {
  const [payment, setPayment] = useState<Payment>({
    recipient_address: "",
    amount: 0,
    token: "",
    blockchain: "",
    orderId: "",
    returnUrl: "",
    appId: "",
    payer: "",
  });

  return (
    <PaymentContext.Provider
      value={{ solanaWallets, payment, setPayment, appId, tokenOptions }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
