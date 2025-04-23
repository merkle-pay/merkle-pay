export const generateDappEncryptionPublicKey = async ({
  mpid,
  orderId,
  paymentId,
  log,
}: {
  mpid: string;
  orderId: string;
  paymentId: number;
  log: (message: string) => void;
}) => {
  try {
    const response = await fetch(
      "/api/payment/phantom/dapp-encryption-public-key",
      {
        method: "POST",
        body: JSON.stringify({
          orderId,
          paymentId,
          mpid,
        }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    log((error as Error).message);
  }
  return {};
};
