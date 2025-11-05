"use client";

import { SETTLED_TX_STATUSES, MAX_TRY_STATUS } from "src/utils/solana";
import { useEffect, useState, useRef } from "react";
import { PaymentStatus } from "src/types/database";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { fetchPaymentStatusQuery } from "src/queries/payment";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Loader2, Copy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  status: PaymentStatus | null;
  mpid: string | null;
  txId: string | null;
  error: string | null;
  needPolling: boolean;
  turnstileSiteKey: string;
};

export default function PaymentStatusClient({
  status: initialStatus,
  mpid,
  txId: initialTxId,
  error: initialError,
  needPolling,
  turnstileSiteKey,
}: Props) {
  const [status, setStatus] = useState<{
    value: PaymentStatus | null;
    error: string | null;
    isFetching: boolean;
  }>({
    value: initialStatus,
    error: initialError,
    isFetching: false,
  });

  const [txId, setTxId] = useState<string | null>(initialTxId);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tryStatusRef = useRef<number>(0);
  const turnstileRef = useRef<TurnstileInstance>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const _antibotToken = await turnstileRef.current?.getResponsePromise();
        if (!_antibotToken) return;
        if (!mpid) return;

        tryStatusRef.current++;

        const result = await fetchPaymentStatusQuery(mpid, _antibotToken);
        turnstileRef.current?.reset();

        if (result.error || !result.data) {
          setStatus((prev) => ({
            ...prev,
            error: result.error || "Failed to fetch status.",
            isFetching: false,
          }));
          return;
        }

        const newStatus = result.data.status;
        const newTxId = result.data.txId;

        // Update txId if we got one
        if (newTxId && newTxId !== txId) {
          setTxId(newTxId);
        }

        if (SETTLED_TX_STATUSES.has(newStatus)) {
          setStatus((prev) => ({
            ...prev,
            value: newStatus,
            error: null,
            isFetching: false,
          }));

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        } else {
          setStatus((prev) => ({
            ...prev,
            value: newStatus,
            error: null,
          }));
        }
      } catch (error) {
        setStatus((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to fetch status.",
          isFetching: false,
        }));
      } finally {
        if (tryStatusRef.current >= MAX_TRY_STATUS) {
          setStatus((prev) => ({
            ...prev,
            error:
              "We have tried to fetch the status of your payment 5 times. Please contact support if the status is not settled.",
            isFetching: false,
          }));
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    };

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (
      mpid &&
      needPolling &&
      (status.value === null || !SETTLED_TX_STATUSES.has(status.value)) &&
      tryStatusRef.current < MAX_TRY_STATUS
    ) {
      setStatus((prev) => ({ ...prev, isFetching: true }));
      intervalRef.current = setInterval(fetchStatus, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [mpid, needPolling, status.value, txId]);

  const getStatusColor = (status: PaymentStatus | null) => {
    if (!status) return "secondary";
    switch (status) {
      case "CONFIRMED":
      case "FINALIZED":
        return "default";
      case "PENDING":
      case "PROCESSED":
        return "secondary";
      case "FAILED":
      case "EXPIRED":
      case "CANCELLED":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div
      className="flex flex-col gap-6 w-full h-full mx-auto px-4 mt-5"
      style={{ maxWidth: "600px" }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {initialError && (
            <Alert variant="destructive">
              <AlertDescription>{initialError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Payment ID
              </span>
              <span className="font-mono text-sm break-all">
                {mpid ?? "Not found"}
              </span>
            </div>

            {txId && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Transaction ID
                </span>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className="font-mono text-sm break-all text-left hover:text-primary transition-colors cursor-pointer"
                          onClick={async () => {
                            await navigator.clipboard.writeText(txId);
                            toast.success("Transaction ID copied to clipboard");
                          }}
                        >
                          {`${txId.slice(0, 12)}...${txId.slice(-12)}`}
                          <Copy className="inline h-3 w-3 ml-1" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono text-xs break-all max-w-xs">
                          {txId}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://solscan.io/tx/${txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="whitespace-nowrap"
                    >
                      View on Solscan
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {status.value && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(status.value)}>
                    {status.value}
                  </Badge>
                  {status.isFetching && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            )}

            {status.error && (
              <Alert variant="destructive">
                <AlertDescription>{status.error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Turnstile ref={turnstileRef} siteKey={turnstileSiteKey} />
    </div>
  );
}
