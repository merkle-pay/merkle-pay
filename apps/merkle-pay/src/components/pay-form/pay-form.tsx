"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "src/components/ui/form";
import { Input } from "src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "src/components/ui/select";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { paymentFormDataSchema } from "../../types/payment";
import { usePaymentStore } from "../../store/payment-store";
import { RecipientWallet } from "../../types/recipient";
import { Blockchain } from "../../types/currency";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  payer: z.string().min(1, "Payer is required"),
  blockchain: z.string().min(1, "Blockchain is required"),
  token: z.string().min(1, "Token is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  orderId: z
    .string()
    .min(1, "Order ID is required")
    .max(100, "Order ID is too long for memo instruction (max 100 characters)"),
  message: z
    .string()
    .max(40, "Message must be less than 40 characters")
    .optional(),
  recipient_address: z.string().min(1, "Recipient address is required"),
  returnUrl: z.string().min(1, "Return URL is required"),
});

type FormData = z.infer<typeof formSchema>;

interface PayFormProps {
  businessNameFromEnv: string | null;
  solanaWallets: RecipientWallet[];
}

export function PayForm({ businessNameFromEnv, solanaWallets }: PayFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    setPaymentFormData,
    businessName: businessNameFromStore,
    tokenOptions,
    blockchainOptions,
    setPaymentFormUrl,
    returnUrl: returnUrlFromStore,
  } = usePaymentStore();

  const form = useForm<FormData>({
    defaultValues: {
      businessName: businessNameFromStore || "",
      payer: "",
      blockchain: "solana",
      token: "USDT",
      amount: 0,
      orderId: "",
      message: "",
      recipient_address: "",
      returnUrl: returnUrlFromStore || "",
    },
  });

  // Initialize form from URL parameters
  useEffect(() => {
    const urlParams = Object.fromEntries(searchParams.entries());
    const formData = {
      ...urlParams,
      amount: urlParams.amount ? Number(urlParams.amount) : undefined,
      businessName: businessNameFromStore,
      returnUrl: returnUrlFromStore,
    };

    // Filter out undefined values
    const filteredData = Object.fromEntries(
      Object.entries(formData).filter(([, value]) => value !== undefined)
    );

    form.reset(filteredData);
  }, [searchParams, form, businessNameFromStore, returnUrlFromStore]);

  const updateUrlParams = useCallback(() => {
    const formValues = form.getValues();
    const params = new URLSearchParams();

    Object.entries(formValues).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        params.set(key, value.toString());
      }

      // Remove businessName from URL if it's set in env
      if (key === "businessName" && businessNameFromEnv) {
        params.delete(key);
      }
    });

    router.push(`/pay?${params.toString()}`, { scroll: false });
  }, [form, router, businessNameFromEnv]);

  const onSubmit = (data: FormData) => {
    // Validate with payment form schema
    const parsedPaymentFormData = paymentFormDataSchema.safeParse({
      ...data,
      businessName: businessNameFromStore,
    });

    if (!parsedPaymentFormData.success) {
      toast.error("Validation Error", {
        description: fromZodError(parsedPaymentFormData.error).message,
      });
      return;
    }

    setPaymentFormData(parsedPaymentFormData.data);
    setPaymentFormUrl(`/pay?${searchParams.toString()}`);

    // Navigate to preview
    router.push("/pay/preview");
  };

  const watchedBlockchain = form.watch("blockchain");

  const isWalletsConfigured = solanaWallets?.length > 0;
  const isBlockchainSupported = watchedBlockchain
    ? solanaWallets.find((wallet) => wallet.blockchain === watchedBlockchain)
    : true;

  if (!isWalletsConfigured || !isBlockchainSupported) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Configuration Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isWalletsConfigured && (
            <p className="text-muted-foreground">
              No wallet addresses have been configured.
            </p>
          )}
          {!isBlockchainSupported && (
            <p className="text-muted-foreground">
              No wallet addresses have been configured for this blockchain.
            </p>
          )}
          <p className="text-muted-foreground">
            Please contact the administrator to set up receiving wallet
            addresses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Payment Form</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payer</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        updateUrlParams();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="blockchain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blockchain</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("recipient_address", "");
                      form.setValue("token", "");
                      updateUrlParams();
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateUrlParams();
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select token symbol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tokenOptions[watchedBlockchain as Blockchain]?.map(
                        (option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      onChange={(e) => {
                        field.onChange(parseFloat(e.target.value));
                        updateUrlParams();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order ID</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        updateUrlParams();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        updateUrlParams();
                      }}
                    />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipient_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      updateUrlParams();
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select recipient's wallet address" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {solanaWallets.map((wallet) => (
                        <SelectItem key={wallet.address} value={wallet.address}>
                          {wallet.address}
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
                <FormItem>
                  <FormLabel>Return URL</FormLabel>
                  <FormControl>
                    <Input {...field} readOnly />
                  </FormControl>
                  <FormDescription>
                    Override this value in the environment variable
                    NEXT_PUBLIC_RETURN_URL or provide it in the url
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
