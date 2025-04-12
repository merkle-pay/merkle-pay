import { Payment } from "src/types/payment";
import { PaymentStatus, prisma } from "../utils/prisma";

export const createPaymentService = async (
  payment: Payment,
  turnstileToken: string
) => {
  const res = await fetch("/api/payment/init", {
    method: "POST",
    body: JSON.stringify({ payment }),
    headers: {
      "Content-Type": "application/json",
      "mp-antibot-token": turnstileToken,
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
      status: PaymentStatus.PENDING,
      referencePublicKey: referencePublicKey,
      recipient_address: payment.recipient_address,
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

export const updatePaymentStatus = async (
  mpid: string,
  status: PaymentStatus
) => {
  const p = await prisma.payment.update({
    where: { mpid },
    data: { status },
  });
  return p;
};
