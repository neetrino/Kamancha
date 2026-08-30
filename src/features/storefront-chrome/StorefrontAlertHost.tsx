"use client";

import { useCallback, useSyncExternalStore } from "react";

import { Toast } from "@/components/ui/Toast";
import {
  clearStorefrontAlert,
  getStorefrontAlertSnapshot,
  subscribeStorefrontAlert,
} from "@/features/storefront-chrome/storefront-alert-store";

const ALERT_DURATION_MS = 5000;

function getServerSnapshot(): null {
  return null;
}

/** Portal host for storefront bag/checkout warnings (e.g. group spend limit). */
export function StorefrontAlertHost() {
  const alert = useSyncExternalStore(
    subscribeStorefrontAlert,
    getStorefrontAlertSnapshot,
    getServerSnapshot,
  );
  const handleClose = useCallback(() => {
    clearStorefrontAlert();
  }, []);

  return (
    <Toast
      key={alert?.token ?? 0}
      open={alert != null}
      message={alert?.message ?? ""}
      tone="warning"
      durationMs={ALERT_DURATION_MS}
      onClose={handleClose}
    />
  );
}
