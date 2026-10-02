"use client";

import { useAdminOrderAlertsContext } from "@/features/orders/ui/AdminOrderAlertsContext";

type AdminOrdersUnseenBadgeProps = {
  ariaLabel: string;
};

/** Numeric badge of unseen new orders for the admin orders page header. */
export function AdminOrdersUnseenBadge({
  ariaLabel,
}: AdminOrdersUnseenBadgeProps) {
  const { unseenCount } = useAdminOrderAlertsContext();
  if (unseenCount <= 0) return null;

  return (
    <span
      className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-brand-forest px-2 text-sm font-semibold text-white"
      aria-label={ariaLabel.replace("{count}", String(unseenCount))}
    >
      {unseenCount}
    </span>
  );
}
