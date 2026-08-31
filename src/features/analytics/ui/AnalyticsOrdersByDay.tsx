import { BarChart3 } from "lucide-react";

import {
  ADMIN_CARD_CLASS,
  ADMIN_CHIP_FOREST,
} from "@/features/admin/ui/admin-ui";
import {
  DASHBOARD_ORDERS_COLOR,
  DASHBOARD_REVENUE_COLOR,
  DashboardTrendSvg,
} from "@/features/admin/ui/DashboardTrendSvg";
import type { AnalyticsCsvRow } from "@/features/analytics/domain/csv";
import { buildAnalyticsTrendSeries } from "@/features/analytics/domain/dashboard-periods";
import { formatAnalyticsShortDate } from "@/features/analytics/domain/date-range";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AnalyticsOrdersByDayProps = {
  from: string;
  to: string;
  rows: AnalyticsCsvRow[];
  formatMoney: (amount: number) => string;
  copy: Dictionary["admin"];
};

export function AnalyticsOrdersByDay({
  from,
  to,
  rows,
  formatMoney,
  copy,
}: AnalyticsOrdersByDayProps) {
  const trendPoints = buildAnalyticsTrendSeries(rows, { from, to });
  const maxOrders = Math.max(...rows.map((row) => row.orderCount), 1);

  return (
    <div className={`${ADMIN_CARD_CLASS} p-4 sm:p-5`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {copy.analytics.ordersByDay.title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {copy.analytics.ordersByDay.subtitle}
          </p>
        </div>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${ADMIN_CHIP_FOREST.bg} ${ADMIN_CHIP_FOREST.fg}`}
        >
          <BarChart3 className="h-3.5 w-3.5" aria-hidden />
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">
          {copy.analytics.ordersByDay.empty}
        </p>
      ) : (
        <>
          <div className="rounded-[12px] bg-gray-50/70 p-3 ring-1 ring-gray-100">
            <div className="mb-2 flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: DASHBOARD_REVENUE_COLOR }}
                />
                {copy.analytics.ordersByDay.revenue}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: DASHBOARD_ORDERS_COLOR }}
                />
                {copy.analytics.metrics.totalOrders}
              </span>
            </div>
            <DashboardTrendSvg
              points={trendPoints}
              chartAria={copy.analytics.ordersByDay.chartAria}
            />
          </div>

          <div className="mt-4 space-y-2">
            {rows.map((row) => {
              const widthPct = Math.max(
                8,
                Math.round((row.orderCount / maxOrders) * 100),
              );
              return (
                <div
                  key={row.date}
                  className="grid grid-cols-[5rem_1fr_auto] items-center gap-3"
                >
                  <p className="text-sm font-medium text-gray-700">
                    {formatAnalyticsShortDate(row.date)}
                  </p>
                  <div className="relative h-8 overflow-hidden rounded-[10px] bg-gray-100">
                    <div
                      className="absolute inset-y-0 left-0 rounded-[10px] bg-brand-forest/80"
                      style={{ width: `${widthPct}%` }}
                    />
                    <span className="relative z-10 ml-3 inline-flex h-full items-center text-xs font-semibold text-white">
                      {copy.analytics.ordersByDay.ordersCount.replace(
                        "{count}",
                        String(row.orderCount),
                      )}
                    </span>
                  </div>
                  <p className="text-right text-sm font-medium text-gray-900">
                    {formatMoney(row.revenueAmount)}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
