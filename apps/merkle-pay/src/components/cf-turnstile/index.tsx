import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, forwardRef, useImperativeHandle } from "react";
import { AntibotToken } from "src/types/antibot";

type CfTurnstileProps = {
  siteKey: string;
  handleTurnstileEvents: (params: AntibotToken) => void;
};

export const CfTurnstile = forwardRef<TurnstileInstance, CfTurnstileProps>(
  ({ siteKey, handleTurnstileEvents }, ref) => {
    const turnstileRef = useRef<TurnstileInstance>(null);

    useImperativeHandle(ref, () => turnstileRef.current as TurnstileInstance);

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
);

CfTurnstile.displayName = "CfTurnstile";
