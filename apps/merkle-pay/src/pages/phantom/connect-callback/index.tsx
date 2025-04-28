import { Alert, Space } from "@arco-design/web-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { GetServerSidePropsContext } from "next";
import { prisma } from "src/utils/prisma";
import { LS_KEYS } from "src/utils/ls";
import { ls } from "src/utils/ls";
import { PhantomConnectCallbackData } from "src/utils/phantom";

export default function ConnectCallback({
  DAPP_PUBLIC_KEY_BASE58,
  DAPP_PRIVATE_KEY_BASE58,
  NONCE,
  DATA,
  PHANTOM_ENCRYPTION_PUBLIC_KEY,
  isError,
  errorCode,
  errorMessage,
}: {
  DAPP_PUBLIC_KEY_BASE58?: string;
  DAPP_PRIVATE_KEY_BASE58?: string;
  NONCE?: string;
  DATA?: string;
  PHANTOM_ENCRYPTION_PUBLIC_KEY?: string;
  isError?: boolean;
  errorCode?: string;
  errorMessage?: string;
}) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(
    isError ? `Error: ${errorCode} - ${errorMessage}` : null
  );

  useEffect(() => {
    if (
      !router.isReady ||
      isError ||
      !DAPP_PRIVATE_KEY_BASE58 ||
      !DAPP_PUBLIC_KEY_BASE58 ||
      !PHANTOM_ENCRYPTION_PUBLIC_KEY ||
      !NONCE ||
      !DATA
    ) {
      return;
    }

    try {
      const decryptedConnectCallbackDataBytes = nacl.box.open(
        bs58.decode(DATA),
        bs58.decode(NONCE),
        bs58.decode(PHANTOM_ENCRYPTION_PUBLIC_KEY),
        bs58.decode(DAPP_PRIVATE_KEY_BASE58)
      );

      if (!decryptedConnectCallbackDataBytes) {
        setError("Failed to decrypt Phantom Connect Callback Params.");
        return;
      }

      const decryptedConnectCallbackDataString = new TextDecoder().decode(
        decryptedConnectCallbackDataBytes
      );

      // ! what is the type ??
      const decryptedConnectCallbackData = JSON.parse(
        decryptedConnectCallbackDataString
      ) as PhantomConnectCallbackData;

      const phantomUniversalLinkParams = ls.getPhantomConnectCallbackParams();

      if (!phantomUniversalLinkParams) {
        setError(`Phantom Connect Callback Params not found`);
        return;
      }

      const { dAppPublicKey, paymentTableRecord, expiry } =
        phantomUniversalLinkParams;

      if (
        !dAppPublicKey ||
        !paymentTableRecord ||
        !expiry ||
        Date.now() > expiry
      ) {
        setError(`Invalid Phantom Connect Callback Params or expired.`);
        return;
      }

      ls.setPhantomUniversalLinkParams({
        ...phantomUniversalLinkParams,
        decryptedConnectCallbackData,
      });

      router.push("/pay/confirm?mobilePhantomStep=sst");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      ls.remove(LS_KEYS.PHANTOM_CONNECT_CALLBACK_PARAMS);
    }
  }, [isError, router.isReady, router.push]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isError || error) {
    return (
      <Space direction="vertical">
        <Alert content={error} />
      </Space>
    );
  }

  return <div>Phantom Connect Callback Page</div>;
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { requestId, phantom_encryption_public_key, nonce, data } = ctx.query;

  if (!phantom_encryption_public_key || !requestId) {
    return {
      props: {
        isError: true,
        errorCode: ctx.query.errorCode,
        errorMessage: ctx.query.errorMessage,
      },
    };
  }

  const phantomDeepLink = await prisma.phantomDeepLink.findFirst({
    where: {
      requestId: requestId as string,
    },
  });

  if (!phantomDeepLink) {
    return {
      props: {
        isError: true,
        errorCode: requestId,
        errorMessage: "Phantom Deep Link not found.",
      },
    };
  }

  return {
    props: {
      DAPP_PRIVATE_KEY_BASE58: phantomDeepLink.privateKey,
      DAPP_PUBLIC_KEY_BASE58: phantomDeepLink.publicKey,
      NONCE: nonce,
      DATA: data,
      PHANTOM_ENCRYPTION_PUBLIC_KEY: phantom_encryption_public_key,
    },
  };
};
