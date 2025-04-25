import { PaymentFormData } from "src/types/payment";
import { PaymentStatus, prisma } from "../utils/prisma";
import { PrismaClientKnownRequestError } from "../../prisma/client/runtime/library";

export const createPaymentTableRecord = async ({
  paymentFormData,
  referencePublicKey,
  mpid,
}: {
  paymentFormData: PaymentFormData;
  referencePublicKey: string;
  mpid: string;
}) => {
  const paymentTableRecord = await prisma.payment.create({
    data: {
      amount: paymentFormData.amount,
      token: paymentFormData.token,
      blockchain: paymentFormData.blockchain,
      orderId: paymentFormData.orderId,
      status: PaymentStatus.PENDING,
      referencePublicKey: referencePublicKey,
      recipient_address: paymentFormData.recipient_address,
      mpid,
      raw: paymentFormData,
      business_name: paymentFormData.businessName,
    },
  });
  return paymentTableRecord;
};

export const getPaymentByMpid = async (mpid: string) => {
  const p = await prisma.payment.findUnique({
    where: { mpid },
  });
  return p;
};

export const updatePaymentTxId = async (mpid: string, txId: string) => {
  const p = await prisma.payment.update({
    where: { mpid },
    data: { txId },
  });
  return p;
};

export const updatePaymentStatus = async ({
  mpid,
  status,
}: {
  mpid: string;
  status: PaymentStatus;
}) => {
  try {
    const p = await prisma.payment.update({
      where: { mpid },
      data: { status },
    });
    return p;
  } catch (error) {
    console.error("Error updating payment status:", error);
  }
  return null;
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
