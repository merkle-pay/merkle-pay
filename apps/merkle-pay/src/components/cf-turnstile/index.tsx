import { Turnstile } from "@marsidev/react-turnstile";
import { AntibotToken } from "src/types/antibot";

export function CfTurnstile({
  handleVerification,
}: {
  handleVerification: (params: AntibotToken) => void;
}) {
  const turnstileSiteKey =
    typeof window !== "undefined" && window.mpGlobal.turnstileSiteKey;

  return (
    <Turnstile
      siteKey={turnstileSiteKey || ""}
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
