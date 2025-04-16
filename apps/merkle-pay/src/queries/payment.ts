import { Payment } from "src/types/payment";

export const createPaymentQuery = async (
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
