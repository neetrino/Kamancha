import Link from "next/link";

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
  return (
    <div
      role="tablist"
      aria-label={labels.aria}
      className="mb-4 flex flex-wrap gap-2"
    >
      {KIND_OPTIONS.map((kind) => {
        const isActive = active === kind;
        const label =
          kind === "all"
            ? labels.all
            : kind === "personal"
              ? labels.personal
              : labels.group;

        return (
          <Link
            key={kind}
            href={hrefForKind(locale, kind, baseQuery)}
            role="tab"
            aria-selected={isActive}
            className={
              isActive
                ? "inline-flex h-9 items-center justify-center rounded-lg bg-gray-900 px-4 text-sm font-medium text-white"
                : "inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
