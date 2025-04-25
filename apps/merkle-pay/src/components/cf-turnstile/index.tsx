import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useEffect } from "react";
import { AntibotToken } from "src/types/antibot";

export function CfTurnstile({
  siteKey,
  handleTurnstileEvents,
  hasBeenUsed,
  setHasBeenUsed,
}: {
  siteKey: string;
  handleTurnstileEvents: (params: AntibotToken) => void;
  hasBeenUsed?: boolean;
  setHasBeenUsed?: (params: boolean) => void;
}) {
  const ref = useRef<TurnstileInstance | null>(null);

  useEffect(() => {
    if (hasBeenUsed === true) {
      ref.current?.reset();
      setHasBeenUsed?.(false);
    }
  }, [hasBeenUsed, setHasBeenUsed]);

  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      onSuccess={(token) => {
        handleTurnstileEvents({
          token,
          error: "",
          isExpired: false,
          isInitialized: true,
        });
      }}
      onError={(error) => {
        handleTurnstileEvents({
          token: "",
          error,
          isExpired: false,
          isInitialized: true,
        });
      }}
      onExpire={() => {
        handleTurnstileEvents({
          token: "",
          error: "",
          isExpired: true,
          isInitialized: true,
        });
      }}
    />
  );
}
