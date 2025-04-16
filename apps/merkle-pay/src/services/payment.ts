import { Payment } from "src/types/payment";
import { PaymentStatus, prisma } from "../utils/prisma";
import { PrismaClientKnownRequestError } from "../../prisma/client/runtime/library";

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
      business_name: payment.businessName,
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

export const updatePaymentTxIdIfNotSet = async ({
  mpid,
  txId,
}: {
  mpid: string;
  txId: string;
}) => {
  try {
    const p = await prisma.payment.update({
      where: { mpid, OR: [{ txId: null }, { txId: "" }] },
      data: { txId },
    });
    return p;
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      console.log(`Payment with mpid ${mpid} not found or txId already set.`);
      return null;
    }
    console.error("Error updating payment txId:", error);
    return null;
  }
};
