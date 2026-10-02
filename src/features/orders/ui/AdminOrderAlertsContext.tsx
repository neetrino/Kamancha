"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";

import type { AdminOrderAlertLatest } from "@/features/orders/application/admin-order-alerts";
import { unlockAdminOrderAlertSound } from "@/features/orders/ui/play-admin-order-alert-sound";
import { useAdminOrderAlerts } from "@/features/orders/ui/use-admin-order-alerts";

type AdminOrderAlertsContextValue = {
  unseenCount: number;
  unseenPersonalCount: number;
  unseenGroupCount: number;
  latest: AdminOrderAlertLatest | null;
  popupOpen: boolean;
  dismissPopup: () => void;
  refresh: () => Promise<void>;
};

const AdminOrderAlertsContext =
  createContext<AdminOrderAlertsContextValue | null>(null);

type AdminOrderAlertsProviderProps = {
  locale: string;
  children: ReactNode;
};

/** Provides shared unseen-order state (poll + sound) across admin shell. */
export function AdminOrderAlertsProvider({
  locale,
  children,
}: AdminOrderAlertsProviderProps) {
  const {
    unseenCount,
    unseenPersonalCount,
    unseenGroupCount,
    latest,
    popupOpen,
    dismissPopup,
    refresh,
    ensureAlertSound,
  } = useAdminOrderAlerts({
    locale,
    playSoundOnArrival: true,
  });

  // Browsers block AudioContext until a user gesture; unlock then restart chime
  // if the popup is already waiting for acknowledge.
  useEffect(() => {
    const unlock = (): void => {
      unlockAdminOrderAlertSound();
      ensureAlertSound();
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [ensureAlertSound]);

  const value = useMemo(
    () => ({
      unseenCount,
      unseenPersonalCount,
      unseenGroupCount,
      latest,
      popupOpen,
      dismissPopup,
      refresh,
    }),
    [
      dismissPopup,
      latest,
      popupOpen,
      refresh,
      unseenCount,
      unseenGroupCount,
      unseenPersonalCount,
    ],
  );

  return (
    <AdminOrderAlertsContext.Provider value={value}>
      {children}
    </AdminOrderAlertsContext.Provider>
  );
}

/** Unseen admin order alert state from the shell provider. */
export function useAdminOrderAlertsContext(): AdminOrderAlertsContextValue {
  const value = useContext(AdminOrderAlertsContext);
  if (!value) {
    throw new Error(
      "useAdminOrderAlertsContext must be used within AdminOrderAlertsProvider",
    );
  }
  return value;
}
