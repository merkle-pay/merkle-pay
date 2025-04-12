import { Turnstile } from "@marsidev/react-turnstile";
import { AntibotToken } from "src/types/antibot";

export function CfTurnstile({
  siteKey,
  handleVerification,
}: {
  siteKey: string;
  handleVerification: (params: AntibotToken) => void;
}) {
  return (
    <Turnstile
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
