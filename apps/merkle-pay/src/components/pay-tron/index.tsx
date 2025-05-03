import { Space } from "@arco-design/web-react";
import { WithTronLinkExtension } from "./with-tronlink-extension";
import { WithTronLinkApp } from "./with-tronlink-app";
// import { WithTronLinkQrCode } from "./with-tronlink-qrcode";

export const TronPaymentMethods = ({
  setAlertMessage,
  isMobileDevice,
}: {
  setAlertMessage: (error: {
    type: "error" | "success" | "info" | null;
    value: React.ReactNode | null;
  }) => void;
  isMobileDevice: boolean;
}) => {
  const hasTronLinkExtension = () => {
    if (typeof window === "undefined") {
      return false;
    }
    return !!window.tronLink;
  };

  return (
    <Space direction="vertical" size={8} style={{ width: "100%" }}>
      {/* <WithTronLinkQrCode setAlertMessage={setAlertMessage} /> */}
      {hasTronLinkExtension() && (
        <WithTronLinkExtension setAlertMessage={setAlertMessage} />
      )}
      {isMobileDevice && <WithTronLinkApp setAlertMessage={setAlertMessage} />}
    </Space>
  );
};
