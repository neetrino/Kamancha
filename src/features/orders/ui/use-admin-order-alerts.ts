"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getAdminOrderAlertsAction,
  type AdminOrderAlertLatest,
} from "@/features/orders/application/admin-order-alerts";
import {
  disposeAdminOrderAlertSound,
  isAdminOrderAlertSoundLooping,
  playAdminOrderAlertSound,
  stopAdminOrderAlertSound,
} from "@/features/orders/ui/play-admin-order-alert-sound";

/** Poll interval for unseen admin order alerts. */
export const ADMIN_ORDER_ALERT_POLL_MS = 5_000;

const DISMISSED_LATEST_STORAGE_KEY =
  "kamancha.adminOrderAlert.dismissedLatest";

function readDismissedLatest(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(DISMISSED_LATEST_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeDismissedLatest(orderNumber: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (orderNumber) {
      window.sessionStorage.setItem(DISMISSED_LATEST_STORAGE_KEY, orderNumber);
    } else {
      window.sessionStorage.removeItem(DISMISSED_LATEST_STORAGE_KEY);
    }
  } catch {
    // Private mode / blocked storage — keep in-memory dismissal only.
  }
}

type UseAdminOrderAlertsOptions = {
  locale: string;
  /**
   * Loop chime while the new-order popup is open (until acknowledge).
   * Also covers first admin entry when unseen orders already exist.
   */
  playSoundOnArrival?: boolean;
};

type UseAdminOrderAlertsResult = {
  unseenCount: number;
  unseenPersonalCount: number;
  unseenGroupCount: number;
  latest: AdminOrderAlertLatest | null;
  /** Whether the new-order popup should be visible. */
  popupOpen: boolean;
  refresh: () => Promise<void>;
  /** Close popup + stop sound; keep NEW badges / counts until status changes. */
  dismissPopup: () => void;
  /** Restart chime if popup is still open (e.g. after AudioContext unlock). */
  ensureAlertSound: () => void;
};

/** Shared poller for admin new-order badge and popup. */
export function useAdminOrderAlerts({
  locale,
  playSoundOnArrival = false,
}: UseAdminOrderAlertsOptions): UseAdminOrderAlertsResult {
  const [unseenCount, setUnseenCount] = useState(0);
  const [unseenPersonalCount, setUnseenPersonalCount] = useState(0);
  const [unseenGroupCount, setUnseenGroupCount] = useState(0);
  const [latest, setLatest] = useState<AdminOrderAlertLatest | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const knownLatestRef = useRef<string | null>(null);
  const dismissedLatestRef = useRef<string | null>(null);
  const hydratedRef = useRef(false);
  const playSoundRef = useRef(playSoundOnArrival);
  const popupOpenRef = useRef(popupOpen);
  playSoundRef.current = playSoundOnArrival;
  popupOpenRef.current = popupOpen;

  useEffect(() => {
    dismissedLatestRef.current = readDismissedLatest();
  }, []);

  // Sound follows popup: loop while open, stop on dismiss / clear.
  useEffect(() => {
    if (!playSoundOnArrival) return;
    if (popupOpen) {
      playAdminOrderAlertSound();
      return;
    }
    stopAdminOrderAlertSound();
  }, [popupOpen, playSoundOnArrival]);

  const refresh = useCallback(async () => {
    const result = await getAdminOrderAlertsAction(locale);
    if (!result.ok) return;

    const nextCount = result.value.unseenCount;
    const nextLatest = result.value.latest;
    const nextKey = nextLatest?.orderNumber ?? null;
    const isNewArrival =
      nextKey != null && nextKey !== knownLatestRef.current;
    const shouldShowPopup =
      nextCount > 0 &&
      nextKey != null &&
      nextKey !== dismissedLatestRef.current;

    if (nextCount === 0) {
      dismissedLatestRef.current = null;
      writeDismissedLatest(null);
      setPopupOpen(false);
    } else if (shouldShowPopup && (isNewArrival || !hydratedRef.current)) {
      setPopupOpen(true);
    }

    setUnseenCount(nextCount);
    setUnseenPersonalCount(result.value.unseenPersonalCount);
    setUnseenGroupCount(result.value.unseenGroupCount);
    setLatest(nextLatest);
    knownLatestRef.current = nextKey;
    hydratedRef.current = true;
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    async function tick(): Promise<void> {
      if (cancelled) return;
      await refresh();
    }

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, ADMIN_ORDER_ALERT_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      disposeAdminOrderAlertSound();
    };
  }, [refresh]);

  const dismissPopup = useCallback(() => {
    const dismissedKey = knownLatestRef.current;
    dismissedLatestRef.current = dismissedKey;
    writeDismissedLatest(dismissedKey);
    setPopupOpen(false);
  }, []);

  const ensureAlertSound = useCallback(() => {
    if (!playSoundRef.current || !popupOpenRef.current) return;
    if (isAdminOrderAlertSoundLooping()) return;
    playAdminOrderAlertSound();
  }, []);

  return {
    unseenCount,
    unseenPersonalCount,
    unseenGroupCount,
    latest,
    popupOpen,
    refresh,
    dismissPopup,
    ensureAlertSound,
  };
}
