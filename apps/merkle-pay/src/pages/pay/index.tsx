import {
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  Typography,
  Space,
  Message,
} from "@arco-design/web-react";
import { IconArrowRight } from "@arco-design/web-react/icon";
import { useRouter } from "next/router";
import { paymentSchema } from "../../types/payment";
import { fromError } from "zod-validation-error";

import { usePaymentStore } from "../../store/payment-store";
import { RecipientWallet } from "../../types/recipient";
import styles from "./index.module.scss";
import { useEffect, useState } from "react";
import clsx from "clsx";

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

  const {
    solanaWallets,
    setPayment,
    businessName: businessNameFromStore,
    tokenOptions,
    setPaymentFormUrl,
    returnUrl: returnUrlFromStore,
  } = usePaymentStore();

  const [isFormInitialized, setIsFormInitialized] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    form.setFieldsValue({
      ...router.query,
      amount: router.query.amount ? Number(router.query.amount) : undefined,
      businessName: businessNameFromStore || router.query.businessName,
      returnUrl: returnUrlFromStore || router.query.returnUrl,
    });
    setIsFormInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, form, businessNameFromStore, returnUrlFromStore]);

  const updateQueryParam = () => {
    if (!isFormInitialized) return;
    const formValues = form.getFieldsValue();
    const _searchParams = new URLSearchParams(
      router.query as unknown as Record<string, string>
    );
    Object.entries(formValues).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        _searchParams.delete(key);
      } else {
        _searchParams.set(key, value.toString());
      }
    });
    router.push(
      {
        pathname: router.pathname,
        query: Object.fromEntries(_searchParams),
      },
      undefined,
      { shallow: true }
    );
  };

  const goToPreview = () => {
    // Save all payment data to context
    const parsedPayment = paymentSchema.safeParse({
      ...router.query,
      amount:
        typeof router.query.amount === "string"
          ? Number(router.query.amount)
          : router.query.amount,
      payer: router.query.payer ?? "",
      businessName: businessNameFromStore || router.query.businessName,
    });

    if (!parsedPayment.success) {
      Message.error(fromError(parsedPayment.error).message);
      return;
    }

    setPayment(parsedPayment.data);
    setPaymentFormUrl(router.asPath);

    // Navigate to preview
    router.push("/pay/preview");
  };

  const isPreviewButtonActive =
    form.getFieldValue("blockchain") &&
    form.getFieldValue("token") &&
    form.getFieldValue("amount") &&
    form.getFieldValue("orderId") &&
    form.getFieldValue("recipient_address") &&
    form.getFieldValue("returnUrl") &&
    form.getFieldValue("businessName") &&
    (!form.getFieldValue("message") ||
      (form.getFieldValue("message") &&
        form.getFieldValue("message").length <= 40));

  // allow empty values in router.query
  // blockchain here is only for confirm the blockchain type,
  // if it's not in the blockchainsFromContext, there will be an error
  // if it's empty, its value will be determined by the wallet selected
  const isWalletsConfigured = solanaWallets?.length > 0;
  // Protection for empty blockchain
  const isBlockchainSupported = router.query.blockchain
    ? [...solanaWallets].find(
        (wallet) => wallet.blockchain === router.query.blockchain
      )
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

  return (
    <>
      <h1>Pay</h1>
      <Form
        className={styles.form}
        form={form}
        layout="vertical"
        onValuesChange={() => {
          updateQueryParam();
        }}
      >
        <Form.Item
          label="Business Name"
          field="businessName"
          required
          className={styles.formItem}
        >
          <Input readOnly />
        </Form.Item>

        <Form.Item
          label="Payer"
          field="payer"
          required
          className={styles.formItem}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Blockchain"
          field="blockchain"
          required
          className={styles.formItem}
        >
          <Select placeholder="Select blockchain">
            {solanaWallets.map((option: RecipientWallet) => (
              <Select.Option key={option.blockchain} value={option.blockchain}>
                {option.blockchain}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Token"
          field="token"
          required
          className={styles.formItem}
        >
          <Select placeholder="Select token symbol">
            {tokenOptions.map((option) => (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Amount"
          field="amount"
          required
          className={styles.formItem}
          validateStatus={
            Number(router.query.amount) > 0 || router.query.amount === undefined
              ? undefined
              : "error"
          }
          help={
            Number(router.query.amount) > 0 || router.query.amount === undefined
              ? undefined
              : "Amount must be greater than 0"
          }
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="Order Id"
          field="orderId"
          required
          className={styles.formItem}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Message"
          field="message"
          extra="Optional"
          className={clsx(styles.formItem, styles.fullWidth)}
          validateStatus={
            router.query.message === undefined ||
            router.query.message === null ||
            router.query.message.length === 0 ||
            router.query.message.length <= 40
              ? undefined
              : "error"
          }
          help={
            router.query.message === undefined ||
            router.query.message === null ||
            router.query.message.length === 0 ||
            router.query.message.length <= 40
              ? undefined
              : "Message must be less than 40 characters"
          }
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Recipient"
          field="recipient_address"
          required
          className={clsx(styles.formItem, styles.fullWidth)}
        >
          <Select placeholder="Select recipient's wallet address">
            {solanaWallets.map((option: RecipientWallet) => (
              <Select.Option key={option.address} value={option.address}>
                {option.address}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Return Url"
          field="returnUrl"
          required
          className={clsx(styles.formItem, styles.fullWidth)}
          extra="Override this value in the environment variable NEXT_PUBLIC_RETURN_URL or provide it in the url"
        >
          <Input readOnly />
        </Form.Item>

        <Button
          onClick={goToPreview}
          type="outline"
          disabled={!isPreviewButtonActive}
          icon={<IconArrowRight />}
          className={styles.previewButton}
        >
          Preview
        </Button>
      </Form>
    </>
  );
}
