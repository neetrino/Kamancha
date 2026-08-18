import Link from "next/link";
import {
  ClipboardList,
  DollarSign,
  Package,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/** Hover lift from ToonExpo analytics KPI cards. */
export const DASHBOARD_CARD_LIFT =
  "transition-[translate,box-shadow] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0";

type MetricTone = "teal" | "green" | "orange" | "accent";

const TONE_BG: Record<MetricTone, string> = {
  teal: "bg-[#d3f6f6]",
  green: "bg-[#dff1f3]",
  orange: "bg-[#fcefe5]",
  accent: "bg-[#f3effd]",
};

const TONE_ICON: Record<MetricTone, string> = {
  teal: "text-[#2bb5ad]",
  green: "text-[#2a9d8f]",
  orange: "text-[#f07a35]",
  accent: "text-[#6b5ce7]",
};

type DashboardStatsGridProps = {
  locale: string;
  copy: Dictionary["admin"]["dashboard"]["stats"];
  users: number;
  products: number;
  orders: number;
  revenueLabel: string;
  revenueDelta?: string;
};

function StatCard({
  href,
  label,
  value,
  hint,
  tone,
  icon: Icon,
}: {
  href: string;
  label: string;
  value: string;
  hint?: string;
  tone: MetricTone;
  icon: LucideIcon;
}) {
  return (
    <Link href={href} className="block h-full">
      <Card
        className={`flex h-full flex-row items-start gap-4 rounded-md border border-gray-200/70 p-4 shadow-sm sm:p-5 ${DASHBOARD_CARD_LIFT}`}
      >
        <div
          className={`inline-flex size-12 shrink-0 items-center justify-center rounded-xl ${TONE_BG[tone]}`}
        >
          <Icon
            className={`size-6 ${TONE_ICON[tone]}`}
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-[11px] font-medium tracking-[0.06em] text-gray-500 uppercase">
            {label}
          </p>
          <p className="text-3xl leading-tight font-semibold tracking-tight text-gray-900">
            {value}
          </p>
          <p className="min-h-4 text-xs text-gray-500">{hint ?? "\u00a0"}</p>
        </div>
      </Card>
    </Link>
  );
}

export function DashboardStatsGrid({
  locale,
  copy,
  users,
  products,
  orders,
  revenueLabel,
  revenueDelta,
}: DashboardStatsGridProps) {
  const base = `/${locale}/admin`;

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <StatCard
        href={`${base}/users`}
        label={copy.users}
        value={String(users)}
        tone="teal"
        icon={Users}
      />
      <StatCard
        href={`${base}/products`}
        label={copy.activeProducts}
        value={String(products)}
        tone="green"
        icon={Package}
      />
      <StatCard
        href={`${base}/orders`}
        label={copy.ordersRange}
        value={String(orders)}
        tone="orange"
        icon={ClipboardList}
      />
      <StatCard
        href={`${base}/analytics`}
        label={copy.revenueRange}
        value={revenueLabel}
        hint={revenueDelta}
        tone="accent"
        icon={DollarSign}
      />
    </div>
  );
}
