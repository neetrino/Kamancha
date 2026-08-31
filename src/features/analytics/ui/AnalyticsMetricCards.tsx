import { Banknote, ClipboardList, Receipt, type LucideIcon } from "lucide-react";

import {
  ADMIN_CARD_CLASS,
  ADMIN_CARD_HOVER_CLASS,
  ADMIN_CHIP_FOREST,
  ADMIN_CHIP_MINT,
  ADMIN_CHIP_SURFACE,
} from "@/features/admin/ui/admin-ui";
import { periodDeltaToneClass } from "@/features/analytics/domain/date-range";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type MetricCard = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  chip: { bg: string; fg: string };
};

type AnalyticsMetricCardsProps = {
  orderCount: number;
  orderDelta: string;
  revenueLabel: string;
  revenueDelta: string;
  averageOrderLabel: string;
  averageOrderDelta: string;
  copy: Dictionary["admin"];
};

export function AnalyticsMetricCards({
  orderCount,
  orderDelta,
  revenueLabel,
  revenueDelta,
  averageOrderLabel,
  averageOrderDelta,
  copy,
}: AnalyticsMetricCardsProps) {
  const metrics: MetricCard[] = [
    {
      label: copy.analytics.metrics.totalOrders,
      value: String(orderCount),
      delta: orderDelta,
      icon: ClipboardList,
      chip: ADMIN_CHIP_FOREST,
    },
    {
      label: copy.analytics.metrics.totalRevenue,
      value: revenueLabel,
      delta: revenueDelta,
      icon: Banknote,
      chip: ADMIN_CHIP_MINT,
    },
    {
      label: copy.analytics.metrics.averageOrderValue,
      value: averageOrderLabel,
      delta: averageOrderDelta,
      icon: Receipt,
      chip: ADMIN_CHIP_SURFACE,
    },
  ];

  return (
    <div className="mb-3 grid gap-3 sm:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div
            key={metric.label}
            className={`${ADMIN_CARD_CLASS} ${ADMIN_CARD_HOVER_CLASS} px-4 py-3.5`}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${metric.chip.bg}`}
                >
                  <Icon className={`h-4 w-4 ${metric.chip.fg}`} aria-hidden />
                </div>
                <p className="truncate text-xs font-medium text-gray-500">
                  {metric.label}
                </p>
              </div>
              <span
                className={`shrink-0 text-[11px] font-semibold ${periodDeltaToneClass(metric.delta)}`}
              >
                {metric.delta}
              </span>
            </div>
            <p className="break-words text-2xl font-bold tracking-tight text-gray-900">
              {metric.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
