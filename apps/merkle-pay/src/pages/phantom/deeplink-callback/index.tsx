import {
  Button,
  Result,
  Space,
  Spin,
  Typography,
} from "@arco-design/web-react";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { prisma } from "src/utils/prisma";
import { GetServerSidePropsContext } from "next";

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
    return <Result status="error" title={errorCode} subTitle={errorMessage} />;
  }

  return (
    <Space direction="vertical" size={48}>
      <Typography.Title heading={3}>Processing Payment...</Typography.Title>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        {data?.signature ? (
          <Button
            type="primary"
            long
            onClick={() => {
              window.open(`https://solscan.io/tx/${data.signature}`, "_blank");
            }}
          >
            Payment successful. Check your transaction on Solana Explorer.
          </Button>
        ) : (
          <Spin dot />
        )}
      </div>
    </Space>
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
  });

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
