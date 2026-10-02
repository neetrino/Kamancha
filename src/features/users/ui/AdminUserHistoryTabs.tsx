"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export type AdminUserHistoryTab = "orders" | "bonuses" | "gifts" | "coupons";

type AdminUserHistoryTabsProps = {
  labels: Record<AdminUserHistoryTab, string>;
  ariaLabel: string;
  panels: Record<AdminUserHistoryTab, ReactNode>;
};

type Indicator = {
  x: number;
  width: number;
  ready: boolean;
};

const TABS: readonly AdminUserHistoryTab[] = [
  "orders",
  "bonuses",
  "gifts",
  "coupons",
];

const INDICATOR_TRANSITION = "transform 160ms ease-out, width 160ms ease-out";

function measureIndicator(
  list: HTMLDivElement,
  button: HTMLButtonElement,
): Pick<Indicator, "x" | "width"> {
  const listRect = list.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  return {
    x: buttonRect.left - listRect.left,
    width: buttonRect.width,
  };
}

export function AdminUserHistoryTabs({
  labels,
  ariaLabel,
  panels,
}: AdminUserHistoryTabsProps) {
  const [active, setActive] = useState<AdminUserHistoryTab>("orders");
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<AdminUserHistoryTab, HTMLButtonElement>>>(
    {},
  );
  const [indicator, setIndicator] = useState<Indicator>({
    x: 0,
    width: 0,
    ready: false,
  });

  useLayoutEffect(() => {
    const list = listRef.current;
    const button = tabRefs.current[active];
    if (!list || !button) return;

    const update = () => {
      setIndicator({ ...measureIndicator(list, button), ready: true });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active, labels]);

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label={ariaLabel}
        className="relative mb-4 flex gap-8 border-b border-gray-200"
      >
        {TABS.map((tab) => {
          const selected = tab === active;
          return (
            <button
              key={tab}
              ref={(node) => {
                if (node) tabRefs.current[tab] = node;
              }}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`py-3.5 text-sm font-medium transition-colors duration-200 ease-out ${
                selected
                  ? "text-brand-forest"
                  : "text-gray-500 hover:text-brand-forest"
              }`}
              onClick={() => setActive(tab)}
            >
              {labels[tab]}
            </button>
          );
        })}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-0.5 bg-brand-forest"
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.x}px)`,
            transition: indicator.ready ? INDICATOR_TRANSITION : "none",
          }}
        />
      </div>
      <div role="tabpanel">{panels[active]}</div>
    </div>
  );
}
