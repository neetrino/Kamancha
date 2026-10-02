"use client";

import { useAdminOrderAlertsContext } from "@/features/orders/ui/AdminOrderAlertsContext";

type AdminOrdersNavBadgeProps = {
  /** Accessible label template with `{count}`. */
  ariaLabel: string;
  /** Compact badge for collapsed sidebar icon. */
  compact?: boolean;
};

/** Red unseen-order count for the admin sidebar Orders nav item. */
export function AdminOrdersNavBadge({
  ariaLabel,
  compact = false,
}: AdminOrdersNavBadgeProps) {
  const { unseenCount } = useAdminOrderAlertsContext();
  if (unseenCount <= 0) return null;

  return (
    <span
      className={
        compact
          ? "absolute -top-1 -right-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white"
          : "inline-flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white"
      }
      aria-label={ariaLabel.replace("{count}", String(unseenCount))}
    >
      {unseenCount}
    </span>
  );
}
