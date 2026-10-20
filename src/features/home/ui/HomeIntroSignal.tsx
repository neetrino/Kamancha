"use client";

import { useReducedMotion } from "motion/react";
import { useLayoutEffect } from "react";

import { isHubHomePath } from "@/features/home/hub-experience-path";
import { writeHubIntroState } from "@/features/home/hub-intro-document";
import { HOME_NAV_REVEAL_MS } from "@/features/home/hub-intro-timing";
import {
  consumePendingDeliveryNavbarDrop,
  isPendingDeliveryNavbarDrop,
  peekStorefrontPathname,
} from "@/features/home/storefront-path-memory";
import type { Locale } from "@/lib/i18n/config";

type HomeIntroSignalProps = {
  locale: Locale;
};

/**
 * Delivery navbar drop — every time the visitor arrives from the hub.
 */
export function HomeIntroSignal({ locale }: HomeIntroSignalProps) {
  const reduceMotion = useReducedMotion() === true;
  const playDrop =
    !reduceMotion &&
    (isPendingDeliveryNavbarDrop() ||
      isHubHomePath(peekStorefrontPathname(), locale));

  useLayoutEffect(() => {
    if (!playDrop) {
      writeHubIntroState("done");
      return;
    }

    consumePendingDeliveryNavbarDrop();
    writeHubIntroState("playing");
    const timer = window.setTimeout(() => {
      writeHubIntroState("done");
    }, HOME_NAV_REVEAL_MS);

    return () => {
      window.clearTimeout(timer);
      writeHubIntroState("done");
    };
  }, [playDrop]);

  return null;
}
