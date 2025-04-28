import { PaymentFormData, paymentTableRecordSchema } from "src/types/payment";
import { z } from "zod";

export const getPaymentRecordDescriptionData = (
  paymentRecord: z.infer<typeof paymentTableRecordSchema> | null
) => {
  if (!paymentRecord) {
    return [];
  }

  return [
    {
      label: "Order ID",
      value: paymentRecord?.orderId,
    },
    {
      label: "Blockchain",
      value: paymentRecord?.blockchain,
    },
    {
      label: "Amount",
      value: `${paymentRecord?.amount} ${paymentRecord?.token}`,
    },
    {
      label: "Business Name",
      value: paymentRecord?.business_name,
    },

    {
      label: "Payer Address",
      value: paymentRecord?.payer_address,
    },
    {
      label: "MPID",
      value: paymentRecord?.mpid,
    },
    {
      label: "Status",
      value: paymentRecord?.status,
    },
    {
      label: "Created At",
      value: paymentRecord?.createdAt,
    },

    {
      label: "Recipient Address",
      value: paymentRecord?.recipient_address,
    },
  ];
};

export const getPaymentFormDataDescriptionData = (
  paymentFormData: PaymentFormData
) => {
  return [
    {
      label: "Payer",
      value: paymentFormData.payer,
    },
    {
      label: "Business Name",
      value: paymentFormData.businessName,
    },
    {
      label: "Order ID",
      value: paymentFormData.orderId,
    },
    {
      label: "Blockchain",
      value: paymentFormData.blockchain,
    },
    {
      label: "Amount",
      value: `${paymentFormData.amount} ${paymentFormData.token}`,
    },
    {
      label: "Recipient",
      value: paymentFormData.recipient_address,
    },
    {
      label: "Message",
      value: paymentFormData.message,
    },
    {
      label: "Return URL",
      value: paymentFormData.returnUrl,
    },
  ];
};
