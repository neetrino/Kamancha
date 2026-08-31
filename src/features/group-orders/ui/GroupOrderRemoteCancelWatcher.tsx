"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import {
  getGroupOrderStatusAction,
  leaveGroupOrderSessionAction,
} from "@/features/group-orders/actions";
import { showStorefrontAlert } from "@/features/storefront-chrome/storefront-alert-store";
import type { Locale } from "@/lib/i18n/config";

/** How often participants check whether the organizer cancelled the group. */
const REMOTE_CANCEL_POLL_MS = 4_000;

type GroupOrderRemoteCancelWatcherProps = {
  inviteToken: string;
  locale: Locale;
  /** Organizer owns cancel UX; only other participants are redirected. */
  enabled: boolean;
  cancelledMessage: string;
};

/**
 * Polls group-order status while a non-organizer session is active.
 * On CANCELLED: alert, clear session, send the participant home.
 */
export function GroupOrderRemoteCancelWatcher({
  inviteToken,
  locale,
  enabled,
  cancelledMessage,
}: GroupOrderRemoteCancelWatcherProps) {
  const router = useRouter();
  const handlingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    let disposed = false;

    async function reactToRemoteCancel(): Promise<void> {
      if (disposed || handlingRef.current) return;
      handlingRef.current = true;
      showStorefrontAlert(cancelledMessage);
      await leaveGroupOrderSessionAction();
      if (disposed) return;
      router.push(`/${locale}`);
      router.refresh();
    }

    async function checkStatus(): Promise<void> {
      if (disposed || handlingRef.current) return;
      try {
        const row = await getGroupOrderStatusAction(inviteToken);
        if (disposed || !row || row.status !== "CANCELLED") return;
        await reactToRemoteCancel();
      } catch {
        // Transient network errors — retry on the next poll tick.
      }
    }

    void checkStatus();
    const timerId = window.setInterval(() => {
      void checkStatus();
    }, REMOTE_CANCEL_POLL_MS);

    return () => {
      disposed = true;
      window.clearInterval(timerId);
    };
  }, [cancelledMessage, enabled, inviteToken, locale, router]);

  return null;
}
