import { Payment } from "src/types/payment";
import { prisma } from "../utils/prisma";

export const createPaymentService = async (payment: Payment) => {
  // !TODO: credentials
  const res = await fetch("/api/payment/init", {
    method: "POST",
    body: JSON.stringify({ payment }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const json = await res.json();

  return {
    data: json.data,
    error: json.code !== 200 ? json.message : null,
  };
};

export const createPayment = async ({
  payment,
  referencePublicKey,
  mpid,
}: {
  payment: Payment;
  referencePublicKey: string;
  mpid: string;
}) => {
  const p = await prisma.payment.create({
    data: {
      amount: payment.amount,
      token: payment.token,
      blockchain: payment.blockchain,
      orderId: payment.orderId,
      status: "pending",
      referencePublicKey: referencePublicKey,
      mpid,
      raw: payment,
    },
  });
  return p;
};

export const getPaymentByMpid = async (mpid: string) => {
  const p = await prisma.payment.findUnique({
    where: { mpid },
  });
  return p;
};
