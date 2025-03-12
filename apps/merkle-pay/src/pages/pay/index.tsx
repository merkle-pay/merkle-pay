import {
  Form,
  Label,
  Input,
  Button,
  Select,
  SelectValue,
  Popover,
  ListBox,
  ListBoxItem,
  TextField,
  NumberField,
  ListBoxSection,
  Header,
  Text,
} from "react-aria-components";
import { useRouter } from "next/router";
import { PayPageQuery, payPageQuerySchema } from "../../../types/payment";
import { fromError } from "zod-validation-error";
import { useState } from "react";
import { usePaymentContext } from "../../context/PaymentContext";
import { RecipientWallet } from "../../../types/recipient";

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
  const router = useRouter();
  const { solanaWallets, setPayment } = usePaymentContext();
  const [selectedWallet, setSelectedWallet] = useState<
    RecipientWallet | undefined
  >();

  // Protection for empty solanaWallets
  if (!solanaWallets || solanaWallets.length === 0) {
    return (
      <div className="error-container">
        <h2>Configuration Error</h2>
        <p>
          No wallet addresses have been configured for this payment processor.
        </p>
        <p>
          Please contact the administrator to set up receiving wallet addresses.
        </p>
      </div>
    );
  }

  const goToPreview = () => {
    // Save all payment data to context
    setPayment({
      amount,
      token,
      blockchain,
      recipientAddress: selectedWallet?.address ?? "",
      orderId,
      sender: payer ?? "",
      returnUrl,
      appId,
    });

    // Navigate to preview
    router.push("/pay/preview");
  };

  const payPageQuery = payPageQuerySchema.safeParse(router.query);

  if (!payPageQuery.success) {
    return <div>Invalid query: {fromError(payPageQuery.error).message}</div>;
  }
  const { payer, blockchain, token, amount, orderId, returnUrl, appId } =
    payPageQuery.data;

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
    <Form className="flex flex-col gap-2">
      <TextField type="text" isRequired>
        <Label>App Id</Label>
        <Input value={appId} readOnly />
        <Text slot="description">
          Hello, dear {payer ?? "customer"}! You are paying to this app: {appId}
        </Text>
      </TextField>
      <TextField
        type="text"
        isRequired
        onChange={(value) => updateQueryParam("blockchain", value)}
      >
        <Label>Blockchain</Label>
        <Input value={blockchain} />
      </TextField>
      <TextField
        type="text"
        isRequired
        onChange={(value) => updateQueryParam("token", value)}
      >
        <Label>Token</Label>
        <Input value={token} />
      </TextField>
      <NumberField
        isRequired
        onChange={(value) => updateQueryParam("amount", value)}
      >
        <Label>Amount</Label>
        <Input value={amount} />
      </NumberField>
      <TextField
        type="text"
        isRequired
        onChange={(value) => updateQueryParam("orderId", value)}
      >
        <Label>Order Id</Label>
        <Input value={orderId} />
      </TextField>
      <Label>Recipient</Label>
      <Select
        isRequired
        onSelectionChange={(key) => {
          const selected = solanaWallets.find((wallet) => wallet.id === key);
          setSelectedWallet(selected);
        }}
      >
        <Button>
          <SelectValue>
            {selectedWallet?.address
              ? `${selectedWallet.blockchain} (${selectedWallet.address})`
              : "Select the recipient's wallet"}
          </SelectValue>
          <span aria-hidden="true">▼</span>
        </Button>
        <Popover>
          <ListBox aria-label="Select a wallet" selectionMode="single">
            <ListBoxSection>
              <Header>Solana</Header>
              {solanaWallets.map((wallet) => (
                <ListBoxItem
                  key={wallet.id}
                  id={wallet.id}
                  value={wallet}
                  aria-label={wallet.address}
                >
                  {`Solana (${wallet.address})`}
                </ListBoxItem>
              ))}
            </ListBoxSection>
          </ListBox>
        </Popover>
      </Select>
      <TextField type="text" isRequired>
        <Label>Return Url</Label>
        <Input value={returnUrl} readOnly />
        <Text slot="description">
          You will be redirected to this page after the payment is confirmed.
        </Text>
      </TextField>
      <Button onPress={goToPreview} isDisabled={!selectedWallet}>
        Preview
      </Button>
    </Form>
  );
}
