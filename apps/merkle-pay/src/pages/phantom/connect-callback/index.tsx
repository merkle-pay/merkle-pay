import { Alert, Space } from "@arco-design/web-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { GetServerSidePropsContext } from "next";
import { prisma } from "src/utils/prisma";
import { LS_KEYS } from "src/utils/ls";
import { ls } from "src/utils/ls";

export default function PhantomConnectCallbackPage({
  DAPP_PRIVATE_KEY_BASE58,
  NONCE,
  DATA,
  PHANTOM_ENCRYPTION_PUBLIC_KEY,
  isError,
  errorCode,
  errorMessage,
}: {
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
      !PHANTOM_ENCRYPTION_PUBLIC_KEY ||
      !NONCE ||
      !DATA
    ) {
      return;
    }

    const decryptedConnectCallbackParamsBytes = nacl.box.open(
      bs58.decode(DATA),
      bs58.decode(NONCE),
      bs58.decode(PHANTOM_ENCRYPTION_PUBLIC_KEY),
      bs58.decode(DAPP_PRIVATE_KEY_BASE58)
    );

    if (!decryptedConnectCallbackParamsBytes) {
      setError("Failed to decrypt Phantom Connect Callback Params.");
      return;
    }

    const decryptedConnectCallbackParams = new TextDecoder().decode(
      decryptedConnectCallbackParamsBytes
    );

    try {
      const json = JSON.parse(decryptedConnectCallbackParams);
      ls.set(LS_KEYS.PHANTOM_CONNECT_CALLBACK_PARAMS, JSON.stringify(json));
      router.push("/pay/confirm");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Unexpected error");
    }
  }, [isError, router.isReady, router.push]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isError || error) {
    return (
      <Space direction="vertical">
        <Alert content={error} />
      </Space>
    );
  }

  return <div>PhantomConnectCallbackPage</div>;
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { phantom_encryption_public_key, nonce, data } = ctx.query;

  if (!phantom_encryption_public_key) {
    return {
      props: {
        isError: true,
        errorCode: ctx.query.errorCode,
        errorMessage: ctx.query.errorMessage,
      },
    };
  }

  const phantomDeepLink = await prisma.phantomDeepLink.findFirstOrThrow({
    where: {
      publicKey: phantom_encryption_public_key as string,
    },
  });

  if (!phantomDeepLink) {
    return {
      props: {},
    };
  }

  return {
    props: {
      DAPP_PRIVATE_KEY_BASE58: phantomDeepLink.privateKey,
      NONCE: nonce,
      DATA: data,
      PHANTOM_ENCRYPTION_PUBLIC_KEY: phantom_encryption_public_key,
    },
  };
};
