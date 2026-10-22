"use client";

import { useEffect, useRef } from "react";

import {
  adminNewOrderNotificationTag,
  formatAdminNewOrderNotification,
} from "@/features/admin-push/domain/new-order-notification";
import type { AdminOrderAlertLatest } from "@/features/orders/application/admin-order-alerts";
import { showAdminOrderSystemNotification } from "@/features/orders/ui/admin-order-browser-notifications";

type UseAdminOrderSystemNotificationOptions = {
  popupOpen: boolean;
  latest: AdminOrderAlertLatest | null;
  copy: { pushTitle: string; pushBody: string };
};

/**
 * Mirrors the new-order popup as an OS notification while the admin tab is
 * hidden (once per order), and closes it once the popup is acknowledged.
 */
export function useAdminOrderSystemNotification({
  popupOpen,
  latest,
  copy,
}: UseAdminOrderSystemNotificationOptions): void {
  const notificationRef = useRef<Notification | null>(null);
  const notifiedOrdersRef = useRef(new Set<string>());

  useEffect(() => {
    if (!popupOpen) {
      notificationRef.current?.close();
      notificationRef.current = null;
      return;
    }
    if (!latest || notifiedOrdersRef.current.has(latest.orderNumber)) return;
    if (document.visibilityState === "visible") return;

    notifiedOrdersRef.current.add(latest.orderNumber);
    notificationRef.current?.close();
    notificationRef.current = showAdminOrderSystemNotification({
      tag: adminNewOrderNotificationTag(latest.orderNumber),
      ...formatAdminNewOrderNotification(copy, latest),
    });
  }, [copy, latest, popupOpen]);

  useEffect(
    () => () => {
      notificationRef.current?.close();
    },
    [],
  );
}
