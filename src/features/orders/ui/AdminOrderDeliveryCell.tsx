import {
  classifyAdminDeliveryDay,
  formatYmdDisplay,
} from "@/features/orders/domain/admin-delivery-day";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminOrderDeliveryCellProps = {
  scheduledDeliveryDate: string | null;
  scheduledDeliveryStart: string | null;
  scheduledDeliveryEnd: string | null;
  copy: Dictionary["admin"]["orders"]["table"];
};

/**
 * Admin orders table cell: scheduled delivery date + slot, with day badge.
 */
export function AdminOrderDeliveryCell({
  scheduledDeliveryDate,
  scheduledDeliveryStart,
  scheduledDeliveryEnd,
  copy,
}: AdminOrderDeliveryCellProps) {
  const kind = classifyAdminDeliveryDay(scheduledDeliveryDate);

  if (kind === "none" || !scheduledDeliveryDate) {
    return <span className="text-sm text-gray-400">{copy.deliveryEmpty}</span>;
  }

  const slot =
    scheduledDeliveryStart && scheduledDeliveryEnd
      ? `${scheduledDeliveryStart}–${scheduledDeliveryEnd}`
      : null;

  const badge =
    kind === "today"
      ? { label: copy.deliveryTodayBadge, className: "bg-brand-forest/10 text-brand-forest" }
      : kind === "tomorrow"
        ? { label: copy.deliveryTomorrowBadge, className: "bg-amber-50 text-amber-800" }
        : {
            label: copy.deliveryLaterBadge,
            className: "bg-violet-50 text-violet-700",
          };

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${badge.className}`}
      >
        {badge.label}
      </span>
      <p className="text-sm font-medium text-gray-900">
        {formatYmdDisplay(scheduledDeliveryDate)}
      </p>
      {slot ? <p className="text-xs text-gray-500">{slot}</p> : null}
    </div>
  );
}
