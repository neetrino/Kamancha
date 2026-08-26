"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

const HOURS = Array.from({ length: 24 }, (_, index) =>
  String(index).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0"),
);

type TimeParts = {
  hour: string;
  minute: string;
};

function parseTime(value: string): TimeParts {
  const [hour = "00", minute = "00"] = value.trim().slice(0, 5).split(":");
  return {
    hour: hour.padStart(2, "0"),
    minute: minute.padStart(2, "0"),
  };
}

function toMinutes(value: string): number {
  const { hour, minute } = parseTime(value);
  return Number(hour) * 60 + Number(minute);
}

function isWithinRange(candidate: string, min?: string, max?: string): boolean {
  const total = toMinutes(candidate);
  if (min && total < toMinutes(min)) return false;
  if (max && total > toMinutes(max)) return false;
  return true;
}

type TimePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  id?: string;
  min?: string;
  max?: string;
  "aria-label"?: string;
};

/** Popover time field (`HH:mm`) styled like site date pickers. */
export function TimePickerField({
  value,
  onChange,
  disabled = false,
  className = "",
  inputClassName = "",
  id,
  min,
  max,
  "aria-label": ariaLabel = "Time",
}: TimePickerFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { hour, minute } = parseTime(value || "00:00");
  const displayValue = `${hour}:${minute}`;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;

    const selectedHour = hourListRef.current?.querySelector(
      '[data-selected="true"]',
    );
    const selectedMinute = minuteListRef.current?.querySelector(
      '[data-selected="true"]',
    );
    selectedHour?.scrollIntoView({ block: "center" });
    selectedMinute?.scrollIntoView({ block: "center" });
  }, [open, hour, minute]);

  function selectPart(nextHour: string, nextMinute: string): void {
    const next = `${nextHour}:${nextMinute}`;
    if (!isWithinRange(next, min, max)) return;
    onChange(next);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`.trim()}>
      <button
        id={fieldId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => {
          if (!disabled) setOpen((current) => !current);
        }}
        className={
          inputClassName
            ? `flex w-full items-center text-left disabled:cursor-not-allowed disabled:opacity-60 ${inputClassName}`.trim()
            : "flex h-10 w-full items-center rounded-xl border border-gray-200 bg-white px-3 text-left text-sm text-gray-900 outline-none transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60"
        }
      >
        {displayValue}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={ariaLabel}
          className="absolute left-0 z-50 mt-2 flex gap-1 rounded-xl border border-gray-200 bg-white p-2"
        >
          <TimeColumn
            listRef={hourListRef}
            values={HOURS}
            selected={hour}
            ariaLabel="Hours"
            isOptionEnabled={(nextHour) =>
              isWithinRange(`${nextHour}:${minute}`, min, max)
            }
            onSelect={(nextHour) => selectPart(nextHour, minute)}
          />
          <TimeColumn
            listRef={minuteListRef}
            values={MINUTES}
            selected={minute}
            ariaLabel="Minutes"
            isOptionEnabled={(nextMinute) =>
              isWithinRange(`${hour}:${nextMinute}`, min, max)
            }
            onSelect={(nextMinute) => selectPart(hour, nextMinute)}
          />
        </div>
      ) : null}
    </div>
  );
}

type TimeColumnProps = {
  values: readonly string[];
  selected: string;
  ariaLabel: string;
  listRef: RefObject<HTMLDivElement | null>;
  isOptionEnabled: (value: string) => boolean;
  onSelect: (value: string) => void;
};

function TimeColumn({
  values,
  selected,
  ariaLabel,
  listRef,
  isOptionEnabled,
  onSelect,
}: TimeColumnProps) {
  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label={ariaLabel}
      className="max-h-48 w-12 overflow-y-auto overscroll-contain"
    >
      {values.map((entry) => {
        const isSelected = entry === selected;
        const enabled = isOptionEnabled(entry);
        return (
          <button
            key={entry}
            type="button"
            role="option"
            aria-selected={isSelected}
            data-selected={isSelected ? "true" : undefined}
            disabled={!enabled}
            onClick={() => onSelect(entry)}
            className={`flex h-8 w-full items-center justify-center rounded-md text-sm transition-colors ${
              isSelected
                ? "bg-brand-forest font-semibold text-white"
                : enabled
                  ? "text-gray-900 hover:bg-gray-100"
                  : "cursor-not-allowed text-gray-300"
            }`}
          >
            {entry}
          </button>
        );
      })}
    </div>
  );
}
