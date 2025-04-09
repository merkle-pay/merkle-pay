import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Typography,
  Space,
} from "@arco-design/web-react";
import { useRouter } from "next/router";
import { PayPageQuery, paymentSchema } from "../../../types/payment";
import { fromError } from "zod-validation-error";

import { usePaymentContext } from "../../context/PaymentContext";
import { RecipientWallet } from "../../../types/recipient";
import styles from "./index.module.scss";
import { useEffect, useState } from "react";

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
  const [isFormInitialized, setIsFormInitialized] = useState(false);

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

  useEffect(() => {
    const initialValues = {
      payer,
      blockchain,
      token,
      recipient_address,
      amount: amount ? Number(amount) : undefined,
      orderId,
      returnUrl: returnUrl || "/pay/status",
      appId: appIdFromContext ?? appId,
    };

    form.setFieldsValue(initialValues);
    setIsFormInitialized(true);
  }, [
    payer,
    blockchain,
    token,
    recipient_address,
    amount,
    orderId,
    returnUrl,
    appId,
    appIdFromContext,
    form,
  ]);

  // Protection for empty solanaWallets
  const isWalletsConfigured = solanaWallets?.length > 0;
  // Protection for empty blockchain
  const isBlockchainSupported = blockchain
    ? [...solanaWallets].find((wallet) => wallet.blockchain === blockchain)
    : true;

  if (!isWalletsConfigured || !isBlockchainSupported) {
    return (
      <Space direction="vertical" size={16}>
        <Typography.Title>Configuration Error</Typography.Title>
        {!isWalletsConfigured && (
          <Typography.Text>
            No wallet addresses have been configured.
          </Typography.Text>
        )}
        {!isBlockchainSupported && (
          <Typography.Text>
            No wallet addresses have been configured for this blockchain.
          </Typography.Text>
        )}
        <Typography.Text>
          Please contact the administrator to set up receiving wallet addresses.
        </Typography.Text>
      </Space>
    );
  }
  const updateQueryParam = (values: {
    key: keyof PayPageQuery;
    value: string | number;
  }) => {
    const nextQuery = new URLSearchParams();
    Object.entries(router.query).forEach(([key, value]) => {
      nextQuery.set(key, value?.toString() ?? "");
    });
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        nextQuery.set(key, value?.toString() ?? "");
      } else {
        nextQuery.delete(key);
      }
    });

    router.push(
      {
        pathname: router.pathname,
        query: Object.fromEntries(nextQuery),
      },
      undefined,
      { shallow: true }
    );
  };

  const goToPreview = () => {
    // Save all payment data to context
    const parsedPayment = paymentSchema.safeParse({
      amount: typeof amount === "string" ? Number(amount) : amount,
      token, // token is the coin, e.g. USDC, USDT, etc, on the blockchain
      blockchain,
      recipient_address,
      orderId,
      sender: payer ?? "",
      returnUrl,
      appId: appIdFromContext ?? appId,
      payer,
    });

    if (!parsedPayment.success) {
      alert(fromError(parsedPayment.error).message);
      return;
    }

    setPayment(parsedPayment.data);

    // Navigate to preview
    router.push("/pay/preview");
  };

  return (
    <Form
      className={styles.form}
      form={form}
      layout="vertical"
      onValuesChange={(changedValues, allValues) => {
        if (!isFormInitialized) return;
        updateQueryParam(
          allValues as {
            key: keyof PayPageQuery;
            value: string | number;
          }
        );
      }}
    >
      <Form.Item label="App Id" field="appId" required>
        <Input
          readOnly={
            !!appIdFromContext /* when appIdFromContext is set in the env, it's not editable */
          }
        />
      </Form.Item>

      <Form.Item
        label="Payer"
        field="payer"
        required
        extra={`Dear ${payer || "customer"}, you are paying for the following order:`}
      >
        <Input />
      </Form.Item>

      <Form.Item label="Blockchain" field="blockchain" required>
        <Select placeholder="Select blockchain">
          {solanaWallets.map((option: RecipientWallet) => (
            <Select.Option key={option.blockchain} value={option.blockchain}>
              {option.blockchain}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Token" field="token" required>
        <Select placeholder="Select token symbol">
          {tokenOptions.map((option) => (
            <Select.Option key={option} value={option}>
              {option}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Amount" field="amount" required>
        <InputNumber />
      </Form.Item>

      <Form.Item label="Order Id" field="orderId" required>
        <Input />
      </Form.Item>

      <Form.Item label="Recipient" field="recipient_address" required>
        <Select placeholder="Select recipient's wallet address">
          {solanaWallets.map((option: RecipientWallet) => (
            <Select.Option key={option.address} value={option.address}>
              {option.address}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Return Url" field="returnUrl" required>
        <Input />
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
