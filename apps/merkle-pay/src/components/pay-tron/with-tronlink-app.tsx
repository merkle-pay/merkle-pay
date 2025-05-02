import { Button } from "@arco-design/web-react";

export const WithTronLinkApp = ({
  setAlertMessage,
}: {
  setAlertMessage: (error: {
    type: "error" | "success" | "info" | null;
    value: React.ReactNode | null;
  }) => void;
}) => {
  return (
    <Button
      type="primary"
      onClick={() => {
        setAlertMessage({ type: "info", value: "TronLink App" });
      }}
    >
      Use TronLink App
    </Button>
  );
};
