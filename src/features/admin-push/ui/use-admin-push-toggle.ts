"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import {
  removeAdminPushSubscriptionAction,
  saveAdminPushSubscriptionAction,
} from "@/features/admin-push/application/admin-push-actions";
import {
  getExistingPushSubscription,
  isWebPushSupported,
  serializePushSubscription,
  subscribeToWebPush,
} from "@/features/admin-push/ui/web-push-client";
import type { Locale } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";

export type AdminPushToggleState = "loading" | "off" | "on" | "blocked" | "error";

type UseAdminPushToggleResult = {
  supported: boolean;
  state: AdminPushToggleState;
  toggle: () => void;
};

const noopSubscribe = (): (() => void) => () => undefined;
const serverSupported = (): boolean => false;

function logToggleError(event: string, error: unknown): void {
  logger.warn(event, {
    error: error instanceof Error ? error.message : String(error),
  });
}

async function resolveInitialState(
  locale: Locale,
): Promise<AdminPushToggleState> {
  const existing = await getExistingPushSubscription();
  if (Notification.permission === "denied") return "blocked";
  if (!existing || Notification.permission !== "granted") return "off";

  // Re-bind the browser subscription to the admin currently signed in.
  const saved = await saveAdminPushSubscriptionAction({
    locale,
    ...serializePushSubscription(existing),
  });
  return saved.ok ? "on" : "error";
}

async function enablePush(
  locale: Locale,
  publicKey: string,
): Promise<AdminPushToggleState> {
  const result = await subscribeToWebPush(publicKey);
  if (result.status === "denied") return "blocked";
  if (result.status === "dismissed") return "off";

  const saved = await saveAdminPushSubscriptionAction({
    locale,
    ...result.subscription,
  });
  return saved.ok ? "on" : "error";
}

async function disablePush(locale: Locale): Promise<AdminPushToggleState> {
  const existing = await getExistingPushSubscription();
  if (!existing) return "off";

  const removed = await removeAdminPushSubscriptionAction({
    locale,
    endpoint: existing.endpoint,
  });
  await existing.unsubscribe();
  return removed.ok ? "off" : "error";
}

/** Browser Web Push subscription state + on/off toggle for admin order alerts. */
export function useAdminPushToggle(
  locale: Locale,
  publicKey: string | null,
): UseAdminPushToggleResult {
  const supported = useSyncExternalStore(
    noopSubscribe,
    isWebPushSupported,
    serverSupported,
  );
  const [state, setState] = useState<AdminPushToggleState>("loading");

  useEffect(() => {
    if (!supported || !publicKey) return;
    let cancelled = false;
    resolveInitialState(locale)
      .then((next) => {
        if (!cancelled) setState(next);
      })
      .catch((error: unknown) => {
        logToggleError("admin_push_toggle_init_failed", error);
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [locale, publicKey, supported]);

  const toggle = useCallback(() => {
    if (!publicKey || state === "loading") return;
    const wasOn = state === "on";
    setState("loading");
    const operation = wasOn
      ? disablePush(locale)
      : enablePush(locale, publicKey);
    operation.then(setState).catch((error: unknown) => {
      logToggleError("admin_push_toggle_failed", error);
      setState("error");
    });
  }, [locale, publicKey, state]);

  return { supported: supported && publicKey != null, state, toggle };
}
