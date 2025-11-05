import nacl from "tweetnacl";
import bs58 from "bs58";
import { prisma } from "src/lib/prisma-compat";
import { GetServerSidePropsContext } from "next";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import { PhantomDeepLink } from "src/types/database";

export default function DeepLinkCallback({
  errorCode,
  errorMessage,
  data,
}: {
  errorCode?: string;
  errorMessage?: string;
  data?: {
    signature: string;
  };
}) {
  if (errorCode || errorMessage) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-semibold">{errorCode}</h2>
        <p className="text-muted-foreground">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      <h3 className="text-xl font-semibold">Processing Payment...</h3>
      <div className="flex justify-center items-center min-h-[50vh]">
        {data?.signature ? (
          <Button
            className="w-full"
            onClick={() => {
              window.open(`https://solscan.io/tx/${data.signature}`, "_blank");
            }}
          >
            Payment successful. Check your transaction on Solana Explorer.
          </Button>
        ) : (
          <Loader2 className="h-8 w-8 animate-spin" />
        )}
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { data, nonce, errorCode, errorMessage, mpid } = ctx.query;

  if (errorCode || errorMessage) {
    return {
      props: {
        errorCode,
        errorMessage,
      },
    };
  }

  const phantomDeepLink = await prisma.phantomDeepLink.findFirst({
    where: { mpid: mpid as string },
  }) as PhantomDeepLink | null;

  if (!phantomDeepLink || !phantomDeepLink.phantom_encryption_public_key) {
    return {
      props: {
        errorCode: "Not Found",
        errorMessage:
          "Phantom deep link or phantom encryption public key not found",
      },
    };
  }

  const { phantom_encryption_public_key, privateKey } = phantomDeepLink;

  const decrypted = nacl.box.open(
    bs58.decode(data as string),
    bs58.decode(nonce as string),
    bs58.decode(phantom_encryption_public_key),
    bs58.decode(privateKey)
  );

  if (!decrypted) {
    return {
      props: {
        errorCode: "Invalid Data",
        errorMessage: "Invalid data",
      },
    };
  }

  const parsedDataObject = JSON.parse(Buffer.from(decrypted).toString("utf8"));

  try {
    await prisma.phantomDeepLink.update({
      where: { id: phantomDeepLink.id },
      data: {
        txId: parsedDataObject.signature,
      },
    });
  } catch (error) {
    console.error(error);
  }

  return {
    props: {
      data: JSON.parse(Buffer.from(decrypted).toString("utf8")),
    },
  };
};
