"use client";

import { useAdminUnreadMessages } from "@/features/contact/ui/AdminUnreadMessagesContext";

type AdminMessagesNavBadgeProps = {
  /** Accessible label template with `{count}`. */
  ariaLabel: string;
  /** Compact badge for the collapsed sidebar icon. */
  compact?: boolean;
};

/** Red unread-message count for the admin sidebar Messages item. */
export function AdminMessagesNavBadge({
  ariaLabel,
  compact = false,
}: AdminMessagesNavBadgeProps) {
  const { unreadCount } = useAdminUnreadMessages();
  if (unreadCount <= 0) return null;

  return (
    <span
      className={
        compact
          ? "absolute -top-1 -right-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white"
          : "inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white"
      }
      aria-label={ariaLabel.replace("{count}", String(unreadCount))}
    >
      {unreadCount}
    </span>
  );
}
