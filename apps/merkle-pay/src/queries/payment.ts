import { Payment, PaymentStatusApiResponse } from "src/types/payment";

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

export const fetchPaymentStatusQuery = async (
  mpid: string | null,
  antibotToken: string
) => {
  if (!mpid) {
    return {
      data: null,
      error: "MPID missing, cannot poll status.",
    };
  }

  const response = await fetch(`/api/payment/status?mpid=${mpid}`, {
    headers: {
      "Content-Type": "application/json",
      "mp-antibot-token": antibotToken,
    },
  });

  if (!response.ok) {
    return {
      data: null,
      error: `API request failed with status ${response.status} and message ${response.statusText}`,
    };
  }
  const result: PaymentStatusApiResponse = await response.json();

  if (!result.data) {
    console.warn("API returned OK but no status data:", result);
    return {
      data: null,
      error: result.message || "Received unexpected data from API.",
    };
  }

  return {
    data: result.data,
    error: null,
  };
};
