import { Button, Space, Typography } from "@arco-design/web-react";

import {
  useWallet,
  WalletProvider,
} from "@tronweb3/tronwallet-adapter-react-hooks";

import {
  WalletDisconnectedError,
  WalletError,
  WalletNotFoundError,
} from "@tronweb3/tronwallet-abstract-adapter";
import { usePaymentStore } from "src/store/payment-store";
import { TRON_TRC20_TOKENS } from "src/utils/tron";
import { useState } from "react";

const WithTronLinkExtensionComponent = ({
  setAlertMessage,
}: {
  setAlertMessage: (error: {
    type: "error" | "success" | "info" | null;
    value: React.ReactNode | null;
  }) => void;
}) => {
  const { wallets } = useWallet();
  const { paymentTableRecord } = usePaymentStore();
  const [txId, setTxId] = useState<string | null>(null);

  const connectTronLink = async () => {
    if (wallets.length === 0) {
      setAlertMessage({
        type: "error",
        value: "No wallets installed",
      });
      return;
    }

    const tronLink = wallets.find((w) => w.adapter.name === "TronLink");
    if (tronLink) {
      if (tronLink.adapter.connected) {
        return;
      }
      try {
        await tronLink.adapter.connect();
        return;
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
  };

  const invokeTronLinkExtension = async () => {
    if (!window.tronLink?.ready) {
      setAlertMessage({
        type: "error",
        value: "TronLink is not installed or not connected",
      });
      return;
    }

    if (!paymentTableRecord) {
      setAlertMessage({
        type: "error",
        value: "Payment record invalid",
      });
    }

    const TRC20_TOKEN =
      TRON_TRC20_TOKENS[
        paymentTableRecord?.token as keyof typeof TRON_TRC20_TOKENS
      ];

    const tokenAddress = TRC20_TOKEN.address;
    const tokenDecimals = TRC20_TOKEN.decimals;

    const amountAsBigNumber = new window.tronLink.tronWeb.BigNumber(
      paymentTableRecord?.amount || 0
    ).multipliedBy(10 ** tokenDecimals);

    if (amountAsBigNumber.isNaN() || amountAsBigNumber.lte(0)) {
      throw new Error("Invalid amount");
    }

    // --- Interact with TRC-20 Contract ---
    const contract = await window.tronLink.tronWeb.contract().at(tokenAddress);

    try {
      // ! GAS FEE COULD BE REALLY EXPENSIVE
      // ! BE CAREFUL WITH THIS
      // ! https://gasfeesnow.com/tron/
      const txId = await contract
        .transfer(
          paymentTableRecord!.recipient_address,
          amountAsBigNumber.toNumber()
        )
        .send({
          feeLimit: 150_000_000,
          callValue: 0,
          shouldPollResponse: false,
        });

      setTxId(txId);

      setAlertMessage({
        type: "success",
        value: (
          <Space direction="vertical" size={8}>
            <Typography.Title heading={5}>Transaction ID</Typography.Title>
            <Typography.Text>{txId}</Typography.Text>
            <Button
              type="primary"
              size="large"
              href={`https://tronscan.org/#/transaction/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on TronScan
            </Button>
          </Space>
        ),
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setAlertMessage({
          type: "error",
          value: error.message,
        });
      }

      if (typeof error === "string") {
        setAlertMessage({
          type: "error",
          value: error,
        });
      }
    }
  };

  if (!paymentTableRecord) {
    setAlertMessage({
      type: "error",
      value: "Payment record invalid",
    });
    return <></>;
  }

  return (
    <Button
      type="primary"
      long
      size="large"
      disabled={!!txId}
      onClick={async () => {
        await connectTronLink();
        await invokeTronLinkExtension();
      }}
    >
      Use TronLink Extension
    </Button>
  );
};

export const WithTronLinkExtension = ({
  setAlertMessage,
}: {
  setAlertMessage: (error: {
    type: "error" | "success" | "info" | null;
    value: React.ReactNode | null;
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
      <WithTronLinkExtensionComponent setAlertMessage={setAlertMessage} />
    </WalletProvider>
  );
};
