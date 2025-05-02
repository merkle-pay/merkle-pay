import { Button } from "@arco-design/web-react";

import {
  useWallet,
  WalletProvider,
} from "@tronweb3/tronwallet-adapter-react-hooks";

import {
  WalletDisconnectedError,
  WalletError,
  WalletNotFoundError,
} from "@tronweb3/tronwallet-abstract-adapter";

const WithTronLinkComponent = ({
  setAlertMessage,
}: {
  setAlertMessage: (error: {
    type: "error" | "success" | "info" | null;
    value: string | null;
  }) => void;
}) => {
  const { wallets } = useWallet();

  return (
    <Button
      type="primary"
      long
      size="large"
      onClick={async () => {
        if (wallets.length == 0) {
          setAlertMessage({
            type: "error",
            value: "No wallets installed",
          });
          return;
        }

        const tronLink = wallets.find((w) => w.adapter.name === "TronLink");
        if (tronLink) {
          if (tronLink.adapter.connected) {
            setAlertMessage({
              type: "success",
              value: "TronLink alreadyconnected",
            });
            return;
          }
          try {
            await tronLink.adapter.connect();
            setAlertMessage({
              type: "success",
              value: "TronLink connected",
            });
          } catch (error) {
            setAlertMessage({
              type: "error",
              value: `TronLink connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            });
          }
        } else {
          setAlertMessage({
            type: "error",
            value: "TronLink is not installed",
          });
        }
      }}
    >
      With TronLink
    </Button>
  );
};

export const WithTronLink = ({
  setAlertMessage,
}: {
  setAlertMessage: (error: {
    type: "error" | "success" | "info" | null;
    value: string | null;
  }) => void;
}) => {
  const onError = (e: WalletError) => {
    if (e instanceof WalletNotFoundError) {
      setAlertMessage({
        type: "error",
        value: "TronLink is not installed",
      });
    } else if (e instanceof WalletDisconnectedError) {
      setAlertMessage({
        type: "error",
        value: "TronLink is not connected",
      });
    } else {
      setAlertMessage({
        type: "error",
        value: `An error occurred: ${e.message}`,
      });
    }
  };

  return (
    <WalletProvider onError={onError}>
      <WithTronLinkComponent setAlertMessage={setAlertMessage} />
    </WalletProvider>
  );
};
