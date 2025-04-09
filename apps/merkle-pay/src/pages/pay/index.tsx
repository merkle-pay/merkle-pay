import { Form, Input, Button, Select } from "@arco-design/web-react";
import { useRouter } from "next/router";
import { PayPageQuery, paymentSchema } from "../../../types/payment";
import { fromError } from "zod-validation-error";

import { usePaymentContext } from "../../context/PaymentContext";
import { RecipientWallet } from "../../../types/recipient";
import styles from "./index.module.scss";

// import { GetServerSidePropsContext } from "next/types";

// solana:
//        <recipient>?amount=<amount>
//       &spl-token=<spl-token>
//       &reference=<reference>
//       &label=<label>
//       &message=<message>
//       &memo=<memo></memo>

// solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId12345

export default function PayPage() {
  const [form] = Form.useForm();
  const router = useRouter();

  // allow empty values
  // blockchain here is only for confirm the blockchain type,
  // if it's not in the blockchainsFromContext, there will be an error
  // if it's empty, its value will be determined by the wallet selected
  const {
    payer,
    blockchain,
    token,
    recipient_address,
    amount,
    orderId,
    returnUrl,
    appId,
  } = router.query as unknown as PayPageQuery;

  const {
    solanaWallets,
    setPayment,
    appId: appIdFromContext,
    tokenOptions,
  } = usePaymentContext();

  // Protection for empty solanaWallets
  const isWalletsConfigured = solanaWallets?.length > 0;
  // Protection for empty blockchain
  const isBlockchainSupported = blockchain
    ? [...solanaWallets].find((wallet) => wallet.blockchain === blockchain)
    : true;

  if (!isWalletsConfigured || !isBlockchainSupported) {
    return (
      <div className={styles.errorContainer}>
        <h2>Configuration Error</h2>
        {!isWalletsConfigured && (
          <p>No wallet addresses have been configured.</p>
        )}
        {!isBlockchainSupported && (
          <p>No wallet addresses have been configured for this blockchain.</p>
        )}
        <p>
          Please contact the administrator to set up receiving wallet addresses.
        </p>
      </div>
    );
  }

  const goToPreview = () => {
    // Save all payment data to context
    const parsedPayment = paymentSchema.safeParse({
      amount: Number(amount),
      token, // token is the coin, e.g. USDC, USDT, etc, on the blockchain
      blockchain,
      recipient_address,
      orderId,
      sender: payer ?? "",
      returnUrl,
      appId: appIdFromContext ?? appId,
    });

    if (!parsedPayment.success) {
      alert(fromError(parsedPayment.error).message);
      return;
    }

    setPayment(parsedPayment.data);

    // Navigate to preview
    router.push("/pay/preview");
  };

  const updateQueryParam = (
    key: keyof PayPageQuery,
    value: string | number
  ) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, [key]: value },
    });
  };

  return (
    <Form
      className={styles.form}
      form={form}
      layout="vertical"
      onChange={(values) => {
        console.log(values);
      }}
    >
      <Form.Item label="App Id" required>
        <Input
          value={appIdFromContext ?? appId}
          readOnly={
            !!appIdFromContext /* when appIdFromContext is set in the env, it's not editable */
          }
          onChange={(value) => {
            updateQueryParam("appId", value);
          }}
        />
      </Form.Item>
      <Form.Item label="Blockchain" required>
        <Select
          value={blockchain}
          placeholder="Select blockchain"
          onChange={(value) => {
            updateQueryParam("blockchain", value);
          }}
        >
          {solanaWallets.map((option: RecipientWallet) => (
            <Select.Option key={option.blockchain} value={option.blockchain}>
              {option.blockchain}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Token" required>
        <Select
          value={token}
          placeholder="Select token symbol"
          onChange={(value) => {
            updateQueryParam("token", value);
          }}
        >
          {tokenOptions.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Amount" required>
        <Input
          value={amount?.toString()}
          onChange={(value) => {
            updateQueryParam("amount", value);
          }}
        />
      </Form.Item>

      <Form.Item label="Order Id" required>
        <Input
          value={orderId}
          onChange={(value) => {
            updateQueryParam("orderId", value);
          }}
        />
      </Form.Item>
      <Form.Item label="Recipient" required>
        <Select
          value={recipient_address}
          placeholder="Select recipient's wallet address"
          onChange={(value) => {
            updateQueryParam("recipient_address", value);
          }}
        >
          {solanaWallets.map((option: RecipientWallet) => (
            <Select.Option key={option.address} value={option.address}>
              {option.address}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Return Url" required>
        <Input value={returnUrl ?? "/pay/status"} readOnly />
      </Form.Item>
      <Button
        onClick={goToPreview}
        disabled={
          !blockchain || !token || !amount || !orderId || !recipient_address
        }
      >
        Preview
      </Button>
    </Form>
  );
}
