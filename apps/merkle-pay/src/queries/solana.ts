export const generateAndSaveNaclKeys = async ({
  mpid,
  orderId,
  paymentId,
  antibotToken,
}: {
  mpid: string;
  orderId: string;
  paymentId: number;
  antibotToken?: string;
}) => {
  try {
    const response = await fetch(
      "/api/payment/phantom/dapp-encryption-public-key",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "mp-antibot-token": antibotToken ?? "",
        },
        body: JSON.stringify({
          orderId,
          paymentId,
          mpid,
        }),
      }
    );
    const data = await response.json();
    return data as {
      dAppPublicKey?: string;
      error?: string;
      requestId?: string;
    };
  } catch (error) {
    console.error((error as Error).message);
  }
  return {} as {
    dAppPublicKey?: string;
    error?: string;
    requestId?: string;
  };
};
