import { Turnstile } from "@marsidev/react-turnstile";

export function CfTurnstile({
  siteKey,
  handleVerification,
}: {
  siteKey: string;
  handleVerification: (params: {
    token?: string;
    error?: string;
    isExpired?: boolean;
  }) => void;
}) {
  return (
    <Turnstile
      siteKey={siteKey}
      onSuccess={(token) => {
        handleVerification({
          token,
        });
      }}
      onError={(error) => {
        handleVerification({
          error,
        });
      }}
      onExpire={() => {
        handleVerification({
          isExpired: true,
        });
      }}
    />
  );
}
