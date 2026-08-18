"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  "aria-label": string;
  value: T;
  options: readonly SegmentedOption<T>[];
  disabled?: boolean;
  onSelect: (value: T) => void;
};

/**
 * Pill segmented control with a sliding active indicator.
 */
export function SegmentedControl<T extends string>({
  "aria-label": ariaLabel,
  value,
  options,
  disabled = false,
  onSelect,
}: SegmentedControlProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeBounds, setActiveBounds] = useState<{
    left: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const active = optionRefs.current[activeIndex];
    if (!container || !active) {
      return;
    }

    const measure = (): void => {
      setActiveBounds({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [activeIndex, options.length]);

  const indicatorStyle: CSSProperties | undefined = activeBounds
    ? { left: activeBounds.left, width: activeBounds.width }
    : undefined;

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label={ariaLabel}
      className="relative flex w-fit max-w-full items-center rounded-[15px] bg-gray-100 p-1"
    >
      {indicatorStyle ? (
        <span
          aria-hidden
          className="pointer-events-none absolute top-1 bottom-1 rounded-[15px] bg-white shadow-sm transition-[left,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={indicatorStyle}
        />
      ) : null}

      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              optionRefs.current[index] = node;
            }}
            type="button"
            disabled={disabled || selected}
            aria-pressed={selected}
            className={`relative z-[1] flex flex-none items-center justify-center rounded-[15px] px-3 py-2 text-sm whitespace-nowrap transition-colors duration-300 ${
              selected
                ? "font-bold text-brand-forest"
                : "font-semibold text-gray-500 hover:text-gray-800"
            }`}
            onClick={() => {
              if (!selected) {
                onSelect(option.value);
              }
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
