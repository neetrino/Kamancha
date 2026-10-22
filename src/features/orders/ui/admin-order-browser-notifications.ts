import { logger } from "@/lib/observability/logger";

type AdminOrderSystemNotificationInput = {
  tag: string;
  title: string;
  body: string;
};

function canShowPageNotification(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    Notification.permission === "granted"
  );
}

/**
 * OS-level notification from the open admin page; stays until clicked and
 * focuses the tab. Permission is only requested by the push toggle.
 */
export function showAdminOrderSystemNotification({
  tag,
  title,
  body,
}: AdminOrderSystemNotificationInput): Notification | null {
  if (!canShowPageNotification()) return null;

  try {
    const notification = new Notification(title, {
      body,
      tag,
      requireInteraction: true,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    return notification;
  } catch (error) {
    logger.warn("admin_order_system_notification_failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
