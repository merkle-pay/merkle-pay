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
// import { GetServerSidePropsContext } from "next/types";

// solana:
//        <recipient>?amount=<amount>
//       &spl-token=<spl-token>
//       &reference=<reference>
//       &label=<label>
//       &message=<message>
//       &memo=<memo></memo>

type Props = {
  solanaWallets: { id: string; address: string }[] | undefined;
};

export default function PayPage({ solanaWallets }: Props) {
  const router = useRouter();
  const [recipient, setRecipient] = useState<string | undefined>(undefined);

  if (!solanaWallets) {
    return <div>No wallets found</div>;
  }

  const payPageQuery = payPageQuerySchema.safeParse(router.query);

  if (!payPageQuery.success) {
    return <div>Invalid query: {fromError(payPageQuery.error).message}</div>;
  }
  const { blockchain, token, amount, orderId, returnUrl, appId } =
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
          Hello, dear customer! You are paying to this app: {appId}
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
      <Select isRequired>
        <Button>
          <SelectValue />
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
                  onAction={() => {
                    // this is dumb
                    // but onSelectionChange is not working on ListBox
                    // and onSelectionChange works only on Select, weird
                    // and it gives the key, not the value, weird times 2
                    setRecipient(wallet.address);
                  }}
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
    </Form>
  );
}

export const getServerSideProps = async () => {
  const solanaWallets = process.env.SOLANA?.split(",") ?? [];
  return {
    props: {
      solanaWallets: solanaWallets.map((wallet) => ({
        id: `solana-${wallet}`,
        address: wallet,
      })),
    },
  };
};
