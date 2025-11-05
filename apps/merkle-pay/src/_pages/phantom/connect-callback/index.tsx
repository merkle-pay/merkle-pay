import nacl from "tweetnacl";
import bs58 from "bs58";
import { GetServerSidePropsContext } from "next";
import { prisma } from "src/lib/db-compat";
import { PhantomConnectCallbackData } from "src/utils/phantom";
import { createPhantomPaymentUniversalLink } from "src/utils/solana";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PhantomDeepLink, Payment } from "src/types/database";

export default function ConnectCallback({
  isError,
  errorCode,
  errorMessage,
  universalLink,
}: {
  universalLink?: string;
  isError?: boolean;
  errorCode?: string;
  errorMessage?: string;
}) {
  const error = isError ? `Error: ${errorCode} - ${errorMessage}` : null;

  if (isError || error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <h3 className="text-xl font-semibold">Ready to Pay</h3>
      <div className="flex justify-center items-center min-h-[50vh]">
        <Button
          size="lg"
          onClick={() => {
            if (universalLink) {
              window.location.href = universalLink;
            }
          }}
        >
          <h3 className="text-xl">Let&apos;s GO!</h3>
        </Button>
      </div>
    </div>
  );
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
  }) as PhantomDeepLink | null;

  if (!phantomDeepLink) {
    return {
      props: {
        isError: true,
        errorCode: requestId,
        errorMessage: "Phantom Deep Link not found.",
      },
    };
  }

  const DAPP_PRIVATE_KEY_BASE58 = phantomDeepLink.privateKey;
  const DAPP_PUBLIC_KEY_BASE58 = phantomDeepLink.publicKey;
  const NONCE = nonce as string;
  const DATA = data as string;
  const PHANTOM_ENCRYPTION_PUBLIC_KEY = phantom_encryption_public_key as string;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

  if (
    !DAPP_PRIVATE_KEY_BASE58 ||
    !DAPP_PUBLIC_KEY_BASE58 ||
    !PHANTOM_ENCRYPTION_PUBLIC_KEY ||
    !NONCE ||
    !DATA ||
    !APP_URL
  ) {
    return {
      props: {
        isError: true,
        errorCode: requestId,
        errorMessage: "Some parameters are missing.",
      },
    };
  }

  const decryptedConnectCallbackDataBytes = nacl.box.open(
    bs58.decode(DATA),
    bs58.decode(NONCE),
    bs58.decode(PHANTOM_ENCRYPTION_PUBLIC_KEY),
    bs58.decode(DAPP_PRIVATE_KEY_BASE58)
  );

  const decryptedConnectCallbackDataString = new TextDecoder().decode(
    decryptedConnectCallbackDataBytes!
  );

  const decryptedConnectCallbackData = JSON.parse(
    decryptedConnectCallbackDataString
  ) as PhantomConnectCallbackData;

  const paymentTableRecord = await prisma.payment.findFirst({
    where: {
      mpid: phantomDeepLink.mpid,
    },
  }) as Payment | null;

  if (!paymentTableRecord) {
    return {
      props: {
        isError: true,
        errorCode: requestId,
        errorMessage: "Payment not found.",
      },
    };
  }

  await prisma.phantomDeepLink.update({
    where: {
      id: phantomDeepLink.id,
    },
    data: {
      phantom_encryption_public_key: PHANTOM_ENCRYPTION_PUBLIC_KEY,
    },
  });

  const universalLink = await createPhantomPaymentUniversalLink(
    {
      recipient_address: paymentTableRecord.recipient_address,
      amount: paymentTableRecord.amount,
      token: paymentTableRecord.token,
      blockchain: paymentTableRecord.blockchain,
      orderId: paymentTableRecord.orderId,
      mpid: paymentTableRecord.mpid,
      business_name: paymentTableRecord.business_name,
    },
    {
      dappEncryptionPublicKey: DAPP_PUBLIC_KEY_BASE58,
      dappPrivateKeyBase58: DAPP_PRIVATE_KEY_BASE58,
      appUrl: APP_URL,
      ...decryptedConnectCallbackData,
      PHANTOM_ENCRYPTION_PUBLIC_KEY: PHANTOM_ENCRYPTION_PUBLIC_KEY,
    }
  );

  return {
    props: {
      universalLink,
    },
  };
};
