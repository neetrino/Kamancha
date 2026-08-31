"use client";

import { useRouter } from "next/navigation";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { CustomerOrderKind } from "@/features/orders/schemas/change-status";

type KindFilterLabels = {
  all: string;
  personal: string;
  group: string;
  aria: string;
};

type AdminOrderKindFilterProps = {
  locale: string;
  active: CustomerOrderKind;
  baseQuery: Record<string, string | undefined>;
  labels: KindFilterLabels;
};

const KIND_OPTIONS: CustomerOrderKind[] = ["all", "personal", "group"];

function hrefForKind(
  locale: string,
  kind: CustomerOrderKind,
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

/**
 * Admin orders kind switch — All / Personal / Group.
 */
export function AdminOrderKindFilter({
  locale,
  active,
  baseQuery,
  labels,
}: AdminOrderKindFilterProps) {
  const router = useRouter();

  const options = KIND_OPTIONS.map((kind) => ({
    value: kind,
    label:
      kind === "all"
        ? labels.all
        : kind === "personal"
          ? labels.personal
          : labels.group,
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
