"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";

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

  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<AdminOrderKind, HTMLButtonElement>>>({});
  const [indicator, setIndicator] = useState({ x: 0, width: 0, ready: false });

  useLayoutEffect(() => {
    const list = listRef.current;
    const button = tabRefs.current[active];
    if (!list || !button) return;

    const update = (): void => {
      const listRect = list.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      setIndicator({
        x: buttonRect.left - listRect.left,
        width: buttonRect.width,
        ready: true,
      });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active, unseenCount, unseenPersonalCount, unseenGroupCount]);

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
    <div
      ref={listRef}
      role="tablist"
      aria-label={labels.aria}
      className="relative mb-4 flex gap-3 border-b border-gray-200"
    >
      {options.map((option) => {
        const selected = option.value === active;
        return (
          <button
            key={option.value}
            ref={(node) => {
              if (node) tabRefs.current[option.value] = node;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`px-3 pt-2.5 pb-2.5 text-[15px] font-medium transition-colors duration-300 ease-out ${
              selected
                ? "text-brand-forest"
                : "text-gray-500 hover:text-brand-forest"
            }`}
            onClick={() => {
              if (!selected) {
                router.push(hrefForKind(locale, option.value, baseQuery));
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 h-0.5 bg-brand-forest"
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.x}px)`,
          transition: indicator.ready
            ? "transform 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1)"
            : "none",
        }}
      />
    </div>
  );
}
