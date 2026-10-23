"use client";

import {
  useLayoutEffect,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";

import { BottomSheet } from "@/components/ui/BottomSheet";
import { BOTTOM_SHEET_SCROLL_ATTR } from "@/components/ui/use-bottom-sheet-drag";
import { BODY_SCROLL_LOCK_ALLOW } from "@/lib/react/use-body-scroll-lock";

const ROW_HEIGHT_PX = 48;
const VISIBLE_ROWS = 5;
const PAD_ROWS = 2;

type WheelColumnProps<T extends string | number> = {
  items: readonly T[];
  value: T;
  format: (item: T) => string;
  onChange: (item: T) => void;
  ariaLabel: string;
};

function WheelColumn<T extends string | number>({
  items,
  value,
  format,
  onChange,
  ariaLabel,
}: WheelColumnProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const index = Math.max(0, items.indexOf(valueRef.current));
    list.scrollTop = index * ROW_HEIGHT_PX;
  }, [items]);

  function handleScroll(): void {
    const list = listRef.current;
    if (!list || items.length === 0) return;
    const index = Math.min(
      items.length - 1,
      Math.max(0, Math.round(list.scrollTop / ROW_HEIGHT_PX)),
    );
    const next = items[index];
    if (next !== undefined && next !== valueRef.current) {
      onChange(next);
    }
  }

  return (
    <div className="relative min-w-0 flex-1">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 bg-red-50"
        style={{ height: ROW_HEIGHT_PX }}
        aria-hidden
      />
      <div
        ref={listRef}
        role="listbox"
        aria-label={ariaLabel}
        {...{ [BODY_SCROLL_LOCK_ALLOW]: "", [BOTTOM_SHEET_SCROLL_ATTR]: "" }}
        onScroll={handleScroll}
        className="relative z-[2] snap-y snap-mandatory overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ height: ROW_HEIGHT_PX * VISIBLE_ROWS }}
      >
        <div style={{ height: ROW_HEIGHT_PX * PAD_ROWS }} />
        {items.map((item) => {
          const selected = item === value;
          return (
            <div
              key={String(item)}
              role="option"
              aria-selected={selected}
              className={`flex snap-center items-center justify-center text-base ${
                selected
                  ? "font-bold text-red-500"
                  : "font-medium text-gray-400"
              }`}
              style={{ height: ROW_HEIGHT_PX }}
            >
              {format(item)}
            </div>
          );
        })}
        <div style={{ height: ROW_HEIGHT_PX * PAD_ROWS }} />
      </div>
    </div>
  );
}

type DeliverySlotWheelSheetProps = {
  open: boolean;
  title: string;
  applyLabel: string;
  closeLabel: string;
  onClose: () => void;
  onApply: () => void;
  children: ReactNode;
};

/** Compact bottom sheet with a centered wheel and an Apply action. */
export function DeliverySlotWheelSheet({
  open,
  title,
  applyLabel,
  closeLabel,
  onClose,
  onApply,
  children,
}: DeliverySlotWheelSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel={title}
      closeLabel={closeLabel}
      zIndexClassName="z-[230]"
      panelClassName="!h-auto bg-white text-gray-900 [&>div:first-child>div]:!bg-gray-300 [&>div:last-child]:!flex-none"
    >
      <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <h2 className="mb-2 text-lg font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2">{children}</div>
        <button
          type="button"
          onClick={onApply}
          className="mt-6 w-full rounded-full bg-red-500 py-3.5 text-base font-semibold text-white"
        >
          {applyLabel}
        </button>
      </div>
    </BottomSheet>
  );
}

export function DeliverySlotWheelColumn<T extends string | number>(
  props: WheelColumnProps<T>,
): ReactElement {
  return <WheelColumn {...props} />;
}
