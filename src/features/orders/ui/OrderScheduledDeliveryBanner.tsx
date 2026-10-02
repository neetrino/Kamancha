import {
  classifyAdminDeliveryDay,
  formatYmdDisplay,
  type AdminDeliveryDayKind,
} from "@/features/orders/domain/admin-delivery-day";

export type OrderScheduledDeliveryBannerLabels = {
  today: string;
  tomorrow: string;
  later: string;
  title: string;
};

type OrderScheduledDeliveryBannerProps = {
  scheduledDeliveryDate: string;
  scheduledDeliveryStart: string | null;
  scheduledDeliveryEnd: string | null;
  labels: OrderScheduledDeliveryBannerLabels;
  /** Compact inline chip for headers; default is a full highlight card. */
  variant?: "card" | "chip";
};

function badgeForKind(
  kind: Exclude<AdminDeliveryDayKind, "none">,
  labels: OrderScheduledDeliveryBannerLabels,
): { label: string; className: string } {
  if (kind === "today") {
    return {
      label: labels.today,
      className: "bg-brand-forest/10 text-brand-forest",
    };
  }
  if (kind === "tomorrow") {
    return {
      label: labels.tomorrow,
      className: "bg-amber-50 text-amber-800",
    };
  }
  return {
    label: labels.later,
    className: "bg-violet-50 text-violet-700",
  };
}

/**
 * Highlights which calendar day a scheduled delivery is for.
 */
export function OrderScheduledDeliveryBanner({
  scheduledDeliveryDate,
  scheduledDeliveryStart,
  scheduledDeliveryEnd,
  labels,
  variant = "card",
}: OrderScheduledDeliveryBannerProps) {
  const kind = classifyAdminDeliveryDay(scheduledDeliveryDate);
  if (kind === "none") return null;

  const badge = badgeForKind(kind, labels);
  const slot =
    scheduledDeliveryStart && scheduledDeliveryEnd
      ? `${scheduledDeliveryStart}–${scheduledDeliveryEnd}`
      : null;
  const dateLabel = formatYmdDisplay(scheduledDeliveryDate);

  if (variant === "chip") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase ${badge.className}`}
      >
        <span>{badge.label}</span>
        <span className="font-medium normal-case opacity-80">
          {dateLabel}
          {slot ? ` · ${slot}` : ""}
        </span>
      </span>
    );
  }

  return (
    <div className="rounded-[16px] bg-gray-50 px-3 py-3 ring-1 ring-gray-100">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${badge.className}`}
        >
          {badge.label}
        </span>
        <p className="text-xs font-medium text-gray-500">{labels.title}</p>
      </div>
      <p className="mt-1.5 text-base font-semibold text-gray-900">{dateLabel}</p>
      {slot ? <p className="mt-0.5 text-sm text-gray-600">{slot}</p> : null}
    </div>
  );
}
