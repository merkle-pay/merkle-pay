import { useRouter } from "next/router";
import { useEffect } from "react";
import { Message } from "@arco-design/web-react";
import nacl from "tweetnacl";
import { prisma } from "src/utils/prisma";

export default function DeepLinkCallback() {
  const router = useRouter();
  const {
    data,
    nonce,
    phantom_encryption_public_key,
    error,
    error_message,
    mpid,
  } = router.query;

  useEffect(() => {
    if (error) {
      Message.error(`Payment failed: ${error_message || error}`);
      router.push("/pay");
      return;
    }
    if (data && nonce && phantom_encryption_public_key && mpid) {
      (async () => {
        try {
          // Retrieve private key from database
          const records = await prisma.phantomDeepLink.findMany({
            where: { mpid: mpid as string },
          });

          if (records.length === 0) throw new Error("Private key not found");

          const record = records[0];

          const decrypted = decryptPayload(
            data as string,
            nonce as string,
            record.privateKey,
            phantom_encryption_public_key as string
          );

          const { signature } = decrypted;
          if (!signature) throw new Error("No signature in response");

          // Optionally delete the private key after use
          await prisma.phantomDeepLink.deleteMany({
            where: { mpid: mpid as string },
          });

          router.push(`/pay/status?mpid=${mpid}&txId=${signature}`);
        } catch (err: unknown) {
          Message.error(
            "Failed to process payment response: " + (err as Error).message
          );
          router.push("/pay");
        }
      })();
    }
  }, [
    data,
    nonce,
    phantom_encryption_public_key,
    mpid,
    error,
    error_message,
    router,
  ]);

  return <div>Processing...</div>;
}

function decryptPayload(
  data: string,
  nonce: string,
  dappEncryptionPrivateKey: string,
  phantomEncryptionPublicKey: string
) {
  const encrypted = Buffer.from(data, "base64");
  const nonceArray = Buffer.from(nonce, "base64");
  const phantomPubkey = Buffer.from(phantomEncryptionPublicKey, "base64");
  const dappPrivateKey = Buffer.from(dappEncryptionPrivateKey, "base64");

  const sharedSecret = nacl.box.before(phantomPubkey, dappPrivateKey);
  const decrypted = nacl.box.open.after(encrypted, nonceArray, sharedSecret);
  if (!decrypted) throw new Error("Unable to decrypt data");

  return JSON.parse(Buffer.from(decrypted).toString("utf8"));
}
