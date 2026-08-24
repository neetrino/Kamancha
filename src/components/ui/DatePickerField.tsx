"use client";

import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { formatYerevanDate } from "@/features/delivery/domain/delivery-schedule";
import {
  buildPickerMonthCells,
  calendarMonthLabel,
  parseYmd,
} from "@/lib/calendar/calendar-grid";
import { formatYmdForDisplay } from "@/lib/calendar/format-date-display";

export type DatePickerFieldLabels = {
  placeholder: string;
  clear: string;
  today: string;
  weekdays: readonly string[];
};

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  locale: string;
  labels: DatePickerFieldLabels;
  name?: string;
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  minDate?: string;
  maxDate?: string;
  isDateEnabled?: (date: string) => boolean;
  showClearToday?: boolean;
  footer?: ReactNode;
  renderTrigger?: (props: {
    id: string;
    open: boolean;
    disabled: boolean;
    onClick: () => void;
  }) => ReactNode;
};

function isWithinBounds(
  date: string,
  minDate?: string,
  maxDate?: string,
  isDateEnabled?: (date: string) => boolean,
): boolean {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  if (isDateEnabled && !isDateEnabled(date)) return false;
  return true;
}

const POPOVER_GAP_PX = 8;

type PopoverPlacement = "bottom" | "top";

function resolvePopoverPlacement(
  triggerRect: DOMRect,
  panelHeight: number,
): PopoverPlacement {
  const spaceBelow = window.innerHeight - triggerRect.bottom - POPOVER_GAP_PX;
  const spaceAbove = triggerRect.top - POPOVER_GAP_PX;

  if (spaceBelow < panelHeight && spaceAbove >= panelHeight) {
    return "top";
  }

  if (spaceBelow < panelHeight && spaceAbove > spaceBelow) {
    return "top";
  }

  return "bottom";
}

/** Popover date field — input + dropdown calendar (not inline, not bottom sheet). */
export function DatePickerField({
  value,
  onChange,
  disabled = false,
  className = "",
  inputClassName = "",
  locale,
  labels,
  name,
  id,
  open: openProp,
  onOpenChange,
  closeOnSelect = true,
  minDate,
  maxDate,
  isDateEnabled,
  showClearToday = true,
  footer,
  renderTrigger,
}: DatePickerFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [openInternal, setOpenInternal] = useState(false);
  const [placement, setPlacement] = useState<PopoverPlacement>("bottom");
  const open = openProp ?? openInternal;
  const setOpen = onOpenChange ?? setOpenInternal;

  const initialParts = value
    ? parseYmd(value)
    : parseYmd(formatYerevanDate(new Date()));
  const [viewYear, setViewYear] = useState(initialParts.year);
  const [viewMonth, setViewMonth] = useState(initialParts.monthIndex);

  useEffect(() => {
    if (!value) return;
    const parts = parseYmd(value);
    setViewYear(parts.year);
    setViewMonth(parts.monthIndex);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open, setOpen]);

  useLayoutEffect(() => {
    if (!open) {
      setPlacement("bottom");
      return;
    }

    function updatePlacement(): void {
      const root = rootRef.current;
      const panel = panelRef.current;
      if (!root || !panel) return;

      setPlacement(
        resolvePopoverPlacement(root.getBoundingClientRect(), panel.offsetHeight),
      );
    }

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    window.addEventListener("scroll", updatePlacement, true);
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, true);
    };
  }, [open, viewYear, viewMonth, footer, showClearToday]);

  function shiftMonth(delta: number): void {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  }

  function selectDate(date: string): void {
    if (!isWithinBounds(date, minDate, maxDate, isDateEnabled)) return;
    onChange(date);
    const parts = parseYmd(date);
    setViewYear(parts.year);
    setViewMonth(parts.monthIndex);
    if (closeOnSelect && !footer) {
      setOpen(false);
    }
  }

  function selectAdjacentDate(date: string): void {
    const parts = parseYmd(date);
    setViewYear(parts.year);
    setViewMonth(parts.monthIndex);
    selectDate(date);
  }

  const cells = buildPickerMonthCells(viewYear, viewMonth);
  const displayValue = value ? formatYmdForDisplay(value) : "";
  const triggerDisabled = disabled;

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      {renderTrigger ? (
        renderTrigger({
          id: fieldId,
          open,
          disabled: triggerDisabled,
          onClick: () => {
            if (!triggerDisabled) setOpen(!open);
          },
        })
      ) : (
        <button
          id={fieldId}
          type="button"
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={`flex h-11 w-full items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 text-left text-sm shadow-sm transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60 ${inputClassName}`.trim()}
        >
          <CalendarDays
            className="h-4 w-4 shrink-0 text-gray-400"
            aria-hidden
          />
          <span className={displayValue ? "text-gray-900" : "text-gray-400"}>
            {displayValue || labels.placeholder}
          </span>
        </button>
      )}

      {name ? <input type="hidden" name={name} value={value} /> : null}

      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={labels.placeholder}
          className={`absolute left-0 z-50 w-[min(100%,20rem)] rounded-xl border border-gray-200 bg-white p-3 ${
            placement === "top"
              ? "bottom-[calc(100%+0.5rem)]"
              : "top-[calc(100%+0.5rem)]"
          }`}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-sm font-medium capitalize text-gray-900">
              {calendarMonthLabel(viewYear, viewMonth, locale)}
            </p>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                className="rounded p-1 text-gray-600 hover:bg-gray-100"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
              >
                <ChevronUp className="h-4 w-4" aria-hidden />
              </button>
              <button
                type="button"
                className="rounded p-1 text-gray-600 hover:bg-gray-100"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
              >
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-xs text-gray-500">
            {labels.weekdays.map((label) => (
              <div key={label} className="py-1 font-medium">
                {label}
              </div>
            ))}
            {cells.map((cell) => {
              const isSelected = value === cell.date;
              const enabled = isWithinBounds(
                cell.date,
                minDate,
                maxDate,
                isDateEnabled,
              );
              return (
                <button
                  key={`${cell.date}-${cell.inMonth ? "in" : "out"}`}
                  type="button"
                  disabled={!enabled}
                  onClick={() =>
                    cell.inMonth
                      ? selectDate(cell.date)
                      : selectAdjacentDate(cell.date)
                  }
                  className={`h-9 rounded-md text-sm transition-colors ${
                    isSelected
                      ? "bg-brand-forest font-semibold text-white"
                      : cell.inMonth
                        ? enabled
                          ? "text-gray-900 hover:bg-gray-100"
                          : "cursor-not-allowed text-gray-300"
                        : enabled
                          ? "text-gray-400 hover:bg-gray-50"
                          : "cursor-not-allowed text-gray-300"
                  }`}
                >
                  {Number(cell.date.slice(-2))}
                </button>
              );
            })}
          </div>

          {footer ? (
            <div className="mt-3 border-t border-gray-100 pt-3">{footer}</div>
          ) : null}

          {showClearToday ? (
            <div className="mt-2 flex items-center justify-between gap-3 border-t border-gray-100 pt-2 text-sm">
              <button
                type="button"
                className="font-medium text-brand-forest hover:underline"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                {labels.clear}
              </button>
              <button
                type="button"
                className="font-medium text-brand-forest hover:underline"
                onClick={() => {
                  const today = formatYerevanDate(new Date());
                  selectDate(today);
                  if (closeOnSelect && !footer) {
                    setOpen(false);
                  }
                }}
              >
                {labels.today}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
