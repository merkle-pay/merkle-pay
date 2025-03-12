import React, { createContext, useContext, useState, ReactNode } from "react";
import { Payment, PaymentContextValue } from "../../types/payment";
import { RecipientWallet } from "../../types/recipient";

// Create the context with default values
const PaymentContext = createContext<PaymentContextValue>({
  payment: {
    recipientAddress: "",
    amount: 0,
    token: "",
    blockchain: "",
    orderId: "",
    returnUrl: "",
    appId: "",
    sender: "",
  } satisfies Payment,
  setPayment: () => {},
  solanaWallets: [],
});

// Custom hook to use the context
export const usePaymentContext = () => useContext(PaymentContext);

// Provider component to wrap your pages
export const PaymentProvider = ({
  children,
  solanaWallets,
}: {
  children: ReactNode;
  solanaWallets: RecipientWallet[];
}) => {
  const [payment, setPayment] = useState<Payment>({
    recipientAddress: "",
    amount: 0,
    token: "",
    blockchain: "",
    orderId: "",
    returnUrl: "",
    appId: "",
    sender: "",
  });

  return (
    <PaymentContext.Provider value={{ solanaWallets, payment, setPayment }}>
      {children}
    </PaymentContext.Provider>
  );
};
