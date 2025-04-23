import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useEffect } from "react";
import { AntibotToken } from "src/types/antibot";

export function CfTurnstile({
  siteKey,
  handleVerification,
  hasBeenUsed,
  setHasBeenUsed,
}: {
  siteKey: string;
  handleVerification: (params: AntibotToken) => void;
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
        handleVerification({
          token,
          error: "",
          isExpired: false,
          isInitialized: true,
        });
      }}
      onError={(error) => {
        handleVerification({
          token: "",
          error,
          isExpired: false,
          isInitialized: true,
        });
      }}
      onExpire={() => {
        handleVerification({
          token: "",
          error: "",
          isExpired: true,
          isInitialized: true,
        });
      }}
    />
  );
}
