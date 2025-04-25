import React, { forwardRef, useRef, useImperativeHandle, Ref } from "react";
import {
  Turnstile,
  TurnstileInstance,
  TurnstileProps,
} from "@marsidev/react-turnstile";

export type CfTurnstileHandle = {
  reset(): void;
  getResponseAsync(): Promise<string | undefined> | undefined;
};

export type CfTurnstileProps = {
  siteKey: string;
  setToken?: (token: string) => void;
  options?: TurnstileProps["options"];
};

export const CfTurnstile = forwardRef<CfTurnstileHandle, CfTurnstileProps>(
  (props, ref: Ref<CfTurnstileHandle>) => {
    const { siteKey, setToken, options } = props;
    const innerRef = useRef<TurnstileInstance>(null);

    useImperativeHandle(
      ref,
      () => ({
        reset: () => innerRef.current?.reset(),
        getResponseAsync: () => innerRef.current?.getResponsePromise(),
      }),
      []
    );

    return (
      <Turnstile
        ref={innerRef}
        siteKey={siteKey}
        options={options}
        onSuccess={(token) => setToken?.(token)}
        onError={() => innerRef.current?.reset()}
        onExpire={() => innerRef.current?.reset()}
        onTimeout={() => innerRef.current?.reset()}
      />
    );
  }
);

CfTurnstile.displayName = "CfTurnstile";
