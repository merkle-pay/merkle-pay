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
import { PaymentFormData, paymentFormDataSchema } from "../../types/payment";
import { fromZodError } from "zod-validation-error";

import { usePaymentStore } from "../../store/payment-store";
import { RecipientWallet } from "../../types/recipient";
import styles from "./index.module.scss";
import { useEffect } from "react";
import clsx from "clsx";
import { Blockchain } from "src/types/currency";

// solana:
//        <recipient>?amount=<amount>
//       &spl-token=<spl-token>
//       &reference=<reference>
//       &label=<label>
//       &message=<message>
//       &memo=<memo></memo>

// solana:mvines9iiHiQTysrwkJjGf2gb9Ex9jXJX8ns3qwf2kN?amount=1&label=Michael&message=Thanks%20for%20all%20the%20fish&memo=OrderId12345

// Ethereum: ERC-681

// request                 = schema_prefix target_address [ "@" chain_id ] [ "/" function_name ] [ "?" parameters ]
// schema_prefix           = "ethereum" ":" [ "pay-" ]
// target_address          = ethereum_address
// chain_id                = 1*DIGIT
// function_name           = STRING
// ethereum_address        = ( "0x" 40*HEXDIG ) / ENS_NAME
// parameters              = parameter *( "&" parameter )
// parameter               = key "=" value
// key                     = "value" / "gas" / "gasLimit" / "gasPrice" / TYPE
// value                   = number / ethereum_address / STRING
// number                  = [ "-" / "+" ] *DIGIT [ "." 1*DIGIT ] [ ( "e" / "E" ) [ 1*DIGIT ] ]

export default function PayPage({
  BUSINESS_NAME_FROM_ENV,
  SOLANA_WALLETS,
}: {
  BUSINESS_NAME_FROM_ENV: string | null;
  SOLANA_WALLETS: RecipientWallet[];
}) {
  const [form] = Form.useForm<PaymentFormData>();
  const router = useRouter();

  const {
    setPaymentFormData,
    businessName: businessNameFromStore,
    tokenOptions,
    blockchainOptions,
    setPaymentFormUrl,
    returnUrl: returnUrlFromStore,
  } = usePaymentStore();

  useEffect(() => {
    if (!router.isReady) return;
    form.setFieldsValue({
      ...router.query,
      amount: router.query.amount ? Number(router.query.amount) : undefined,
      businessName: businessNameFromStore, // should not be updated
      returnUrl: returnUrlFromStore, // should not be updated
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, form, businessNameFromStore, returnUrlFromStore]);

  const updateQueryParam = () => {
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

      // businessName should be removed from url if it's already set in env
      if (key === "businessName") {
        if (BUSINESS_NAME_FROM_ENV) {
          _searchParams.delete(key);
        }
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
    const parsedPaymentFormData = paymentFormDataSchema.safeParse({
      ...router.query,
      amount:
        typeof router.query.amount === "string"
          ? Number(router.query.amount)
          : router.query.amount,
      payer: router.query.payer ?? "",
      businessName: businessNameFromStore,
    });

    if (!parsedPaymentFormData.success) {
      Message.error(fromZodError(parsedPaymentFormData.error).message);
      return;
    }

    setPaymentFormData(parsedPaymentFormData.data);
    setPaymentFormUrl(router.asPath);

    // Navigate to preview
    router.push("/pay/preview");
  };

  const message = form.getFieldValue("message");
  const hasMessageLessThan40 =
    typeof message === "string" && message.length <= 40;
  const isPreviewButtonActive =
    form.getFieldValue("blockchain") &&
    form.getFieldValue("token") &&
    form.getFieldValue("amount") &&
    form.getFieldValue("orderId") &&
    form.getFieldValue("recipient_address") &&
    form.getFieldValue("returnUrl") &&
    form.getFieldValue("businessName") &&
    (!message || hasMessageLessThan40); // no message or message is less than 40 characters

  // allow empty values in router.query
  // blockchain here is only for confirm the blockchain type,
  // if it's not in the blockchainsFromContext, there will be an error
  // if it's empty, its value will be determined by the wallet selected
  const isWalletsConfigured = SOLANA_WALLETS?.length > 0;

  // If blockchain is set, check if it's supported
  const isBlockchainSupported = router.query.blockchain
    ? SOLANA_WALLETS.find(
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
          <Select
            placeholder="Select blockchain"
            onChange={() => {
              form.resetFields(["recipient_address", "token"]);
            }}
          >
            {blockchainOptions.map((option) => (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          shouldUpdate={(prevValues, nextValues) => {
            return prevValues.blockchain !== nextValues.blockchain;
          }}
          noStyle
        >
          {(values) => {
            const _tokenOptions =
              tokenOptions[
                (values.blockchain ??
                  router.query.blockchain ??
                  "solana") as Blockchain
              ];
            return (
              <Form.Item
                label="Token"
                field="token"
                required
                className={styles.formItem}
              >
                <Select placeholder="Select token symbol">
                  {_tokenOptions!.map((option) => (
                    <Select.Option key={option} value={option}>
                      {option}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }}
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
          validateStatus={
            !!router.query.orderId?.length && router.query.orderId?.length > 100
              ? "error"
              : undefined
          }
          help={
            !!router.query.orderId?.length && router.query.orderId?.length > 100
              ? "Order ID is too long for memo instruction (max 100 characters)."
              : undefined
          }
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
            {SOLANA_WALLETS.map((option: RecipientWallet) => (
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

export const getServerSideProps = async () => {
  const BUSINESS_NAME_FROM_ENV = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? null;
  const SOLANA_WALLETS_PUBLIC_ENV =
    process.env.NEXT_PUBLIC_SOLANA_WALLETS?.split(",") ?? [];
  const SOLANA_WALLETS: RecipientWallet[] = SOLANA_WALLETS_PUBLIC_ENV.map(
    (wallet) => ({
      id: `solana-${wallet}`,
      address: wallet,
      blockchain: "solana",
    })
  );

  return {
    props: {
      BUSINESS_NAME_FROM_ENV,
      SOLANA_WALLETS,
    },
  };
};
