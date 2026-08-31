import Link from "next/link";

import type { CustomerOrderKind } from "@/features/orders/schemas/change-status";

type KindFilterLabels = {
  all: string;
  personal: string;
  group: string;
  aria: string;
};

type CustomerOrderKindFilterProps = {
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
    ? `/${locale}/profile/orders?${query}`
    : `/${locale}/profile/orders`;
}

/**
 * Profile orders kind switch — All / Personal / Group.
 */
export function CustomerOrderKindFilter({
  locale,
  active,
  baseQuery,
  labels,
}: CustomerOrderKindFilterProps) {
  return (
    <div
      role="tablist"
      aria-label={labels.aria}
      className="flex flex-wrap gap-2"
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
                ? "inline-flex h-10 items-center justify-center rounded-full bg-brand-forest px-5 font-big-fat-boii text-xs font-normal tracking-wide text-white uppercase xl:bg-white xl:text-brand-forest"
                : "inline-flex h-10 items-center justify-center rounded-full border border-gray-200 bg-white px-5 font-big-fat-boii text-xs font-normal tracking-wide text-gray-800 uppercase transition-colors hover:bg-gray-50 xl:border-white/50 xl:bg-white/25 xl:text-white xl:hover:bg-white/40"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
