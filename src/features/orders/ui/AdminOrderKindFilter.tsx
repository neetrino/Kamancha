"use client";

import { useRouter } from "next/navigation";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  ADMIN_ORDER_KINDS,
  type AdminOrderKind,
} from "@/features/orders/schemas/change-status";
import { useAdminOrderAlertsContext } from "@/features/orders/ui/AdminOrderAlertsContext";

type KindFilterLabels = {
  all: string;
  personal: string;
  group: string;
  new: string;
  aria: string;
};

type AdminOrderKindFilterProps = {
  locale: string;
  active: AdminOrderKind;
  baseQuery: Record<string, string | undefined>;
  labels: KindFilterLabels;
};

function hrefForKind(
  locale: string,
  kind: AdminOrderKind,
  baseQuery: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(baseQuery)) {
    if (value) params.set(key, value);
  }
  if (kind !== "all") {
    params.set("kind", kind);
  }
  params.set("page", "1");
  const query = params.toString();
  return query
    ? `/${locale}/admin/orders?${query}`
    : `/${locale}/admin/orders`;
}

function KindLabel({
  text,
  count,
}: {
  text: string;
  count: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{text}</span>
      {count > 0 ? (
        <span className="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-brand-forest px-1.5 text-[10px] font-semibold text-white">
          {count}
        </span>
      ) : null}
    </span>
  );
}

function kindLabelText(
  kind: AdminOrderKind,
  labels: KindFilterLabels,
): string {
  if (kind === "personal") return labels.personal;
  if (kind === "group") return labels.group;
  if (kind === "new") return labels.new;
  return labels.all;
}

function kindUnseenCount(
  kind: AdminOrderKind,
  counts: {
    all: number;
    personal: number;
    group: number;
  },
): number {
  if (kind === "personal") return counts.personal;
  if (kind === "group") return counts.group;
  if (kind === "new" || kind === "all") return counts.all;
  return 0;
}

/**
 * Admin orders kind switch — All / Personal / Group / New.
 * Shows unseen counts on each segment.
 */
export function AdminOrderKindFilter({
  locale,
  active,
  baseQuery,
  labels,
}: AdminOrderKindFilterProps) {
  const router = useRouter();
  const { unseenCount, unseenPersonalCount, unseenGroupCount } =
    useAdminOrderAlertsContext();
  const counts = {
    all: unseenCount,
    personal: unseenPersonalCount,
    group: unseenGroupCount,
  };

  const options = ADMIN_ORDER_KINDS.map((kind) => ({
    value: kind,
    label: (
      <KindLabel
        text={kindLabelText(kind, labels)}
        count={kindUnseenCount(kind, counts)}
      />
    ),
  }));

  return (
    <div className="mb-4">
      <SegmentedControl
        aria-label={labels.aria}
        value={active}
        options={options}
        onSelect={(kind) => {
          router.push(hrefForKind(locale, kind, baseQuery));
        }}
      />
    </div>
  );
}
