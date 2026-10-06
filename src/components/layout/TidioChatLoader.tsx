"use client";

import Script from "next/script";
import { useEffect } from "react";

import type { Locale } from "@/lib/i18n/config";

export type TidioVisitor = {
  distinct_id: string;
  email: string;
  name: string;
};

type TidioChatApi = {
  setVisitorData: (visitor: TidioVisitor) => void;
};

declare global {
  interface Document {
    tidioChatLang?: string;
    tidioIdentify?: TidioVisitor;
  }

  interface Window {
    tidioChatApi?: TidioChatApi;
  }
}

type TidioChatLoaderProps = {
  publicKey: string;
  locale: Locale;
  visitor: TidioVisitor | null;
};

/**
 * Configures language and signed-in visitor identity before the Tidio widget
 * loads, and pushes identity updates to an already loaded widget.
 */
export function TidioChatLoader({
  publicKey,
  locale,
  visitor,
}: TidioChatLoaderProps) {
  useEffect(() => {
    document.tidioChatLang = locale;
  }, [locale]);

  useEffect(() => {
    if (!visitor) {
      delete document.tidioIdentify;
      return;
    }

    document.tidioIdentify = visitor;
    window.tidioChatApi?.setVisitorData(visitor);
  }, [visitor]);

  return (
    <Script
      id="tidio-chat"
      src={`https://code.tidio.co/${publicKey}.js`}
      strategy="lazyOnload"
    />
  );
}
