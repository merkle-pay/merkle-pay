import { useRouter } from "next/router";
import { PaymentFormData, paymentFormDataSchema } from "../../types/payment";
import { fromZodError } from "zod-validation-error";
import { usePaymentStore } from "../../store/payment-store";
import { RecipientWallet } from "../../types/recipient";
import styles from "./index.module.scss";
import { useEffect } from "react";
import clsx from "clsx";
import { Blockchain } from "src/types/currency";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const router = useRouter();

  const {
    setPaymentFormData,
    businessName: businessNameFromStore,
    tokenOptions,
    blockchainOptions,
    setPaymentFormUrl,
    returnUrl: returnUrlFromStore,
  } = usePaymentStore();

  const form = useForm<PaymentFormData>({
    defaultValues: {
      businessName: businessNameFromStore,
      payer: "",
      blockchain: undefined,
      token: undefined,
      amount: undefined,
      orderId: "",
      message: "",
      recipient_address: "",
      returnUrl: returnUrlFromStore,
    },
  });

  useEffect(() => {
    if (!router.isReady) return;
    form.reset({
      ...router.query,
      amount: router.query.amount ? Number(router.query.amount) : undefined,
      businessName: businessNameFromStore,
      returnUrl: returnUrlFromStore,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, businessNameFromStore, returnUrlFromStore]);

  const updateQueryParam = () => {
    const formValues = form.getValues();
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
      toast.error(fromZodError(parsedPaymentFormData.error).message);
      return;
    }

    setPaymentFormData(parsedPaymentFormData.data);
    setPaymentFormUrl(router.asPath);

    // Navigate to preview
    router.push("/pay/preview");
  };

  const message = form.watch("message");
  const blockchain = form.watch("blockchain");
  const token = form.watch("token");
  const amount = form.watch("amount");
  const orderId = form.watch("orderId");
  const recipient_address = form.watch("recipient_address");
  const returnUrl = form.watch("returnUrl");
  const businessName = form.watch("businessName");

  const hasMessageLessThan40 =
    typeof message === "string" && message.length <= 40;
  const isPreviewButtonActive =
    blockchain &&
    token &&
    amount &&
    orderId &&
    recipient_address &&
    returnUrl &&
    businessName &&
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
      <div className="flex flex-col gap-4">
        <h1>Configuration Error</h1>
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

  return (
    <>
      <h1>Pay</h1>
      <Form {...form}>
        <form
          className={styles.form}
          onSubmit={(e) => e.preventDefault()}
        >
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel>Business Name *</FormLabel>
                <FormControl>
                  <Input readOnly {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="payer"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel>Payer *</FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => {
                    field.onChange(e);
                    updateQueryParam();
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="blockchain"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel>Blockchain *</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("recipient_address", "");
                    form.setValue("token", "");
                    updateQueryParam();
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blockchain" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {blockchainOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="token"
            render={({ field }) => {
              const _tokenOptions =
                tokenOptions[
                  (blockchain ?? router.query.blockchain ?? "solana") as Blockchain
                ];
              return (
                <FormItem className={styles.formItem}>
                  <FormLabel>Token *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateQueryParam();
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select token symbol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {_tokenOptions!.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const value = e.target.value === "" ? undefined : Number(e.target.value);
                      field.onChange(value);
                      updateQueryParam();
                    }}
                  />
                </FormControl>
                {Number(router.query.amount) > 0 || router.query.amount === undefined ? null : (
                  <p className="text-sm text-destructive">Amount must be greater than 0</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orderId"
            render={({ field }) => (
              <FormItem className={styles.formItem}>
                <FormLabel>Order Id *</FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => {
                    field.onChange(e);
                    updateQueryParam();
                  }} />
                </FormControl>
                {!!router.query.orderId?.length && router.query.orderId?.length > 100 ? (
                  <p className="text-sm text-destructive">
                    Order ID is too long for memo instruction (max 100 characters).
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className={clsx(styles.formItem, styles.fullWidth)}>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Input {...field} onChange={(e) => {
                    field.onChange(e);
                    updateQueryParam();
                  }} />
                </FormControl>
                <FormDescription>Optional</FormDescription>
                {router.query.message &&
                typeof router.query.message === "string" &&
                router.query.message.length > 40 ? (
                  <p className="text-sm text-destructive">
                    Message must be less than 40 characters
                  </p>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recipient_address"
            render={({ field }) => (
              <FormItem className={clsx(styles.formItem, styles.fullWidth)}>
                <FormLabel>Recipient *</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    updateQueryParam();
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient's wallet address" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SOLANA_WALLETS.map((option: RecipientWallet) => (
                      <SelectItem key={option.address} value={option.address}>
                        {option.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="returnUrl"
            render={({ field }) => (
              <FormItem className={clsx(styles.formItem, styles.fullWidth)}>
                <FormLabel>Return Url *</FormLabel>
                <FormControl>
                  <Input readOnly {...field} />
                </FormControl>
                <FormDescription>
                  Override this value in the environment variable NEXT_PUBLIC_RETURN_URL or provide it in the url
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            onClick={goToPreview}
            variant="outline"
            disabled={!isPreviewButtonActive}
            className={styles.previewButton}
          >
            Preview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
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
