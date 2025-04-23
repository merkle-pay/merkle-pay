import { useEffect, useState } from "react";

interface DeviceInfo {
  isMobileDevice: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

const IOS_REGEX = /iPhone|iPad|iPod/i;
const ANDROID_REGEX = /Android/i;

export const useIsMobileDevice = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobileDevice: false,
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    // Check only on client-side after mount
    if (typeof window !== "undefined" && navigator.userAgent) {
      const userAgent = navigator.userAgent;
      const isIOS = IOS_REGEX.test(userAgent);
      const isAndroid = ANDROID_REGEX.test(userAgent);

      setDeviceInfo({
        isMobileDevice: isIOS || isAndroid,
        isIOS,
        isAndroid,
      });
    }
  }, []); // Run only once on mount

  return deviceInfo;
};
