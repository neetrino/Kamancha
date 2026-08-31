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

type CustomerOrderKindFilterProps = {
  locale: string;
  active: CustomerOrderKind;
  baseQuery: Record<string, string | undefined>;
  labels: KindFilterLabels;
  /** `onDark` for glass filter bar; default gray for light surfaces. */
  tone?: "default" | "onDark";
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
  tone = "default",
}: CustomerOrderKindFilterProps) {
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
    <SegmentedControl
      aria-label={labels.aria}
      value={active}
      options={options}
      tone={tone}
      onSelect={(kind) => {
        router.push(hrefForKind(locale, kind, baseQuery));
      }}
    />
  );
}
