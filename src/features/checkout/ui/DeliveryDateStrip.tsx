"use client";

import { useRef, useState } from "react";

import {
  CALENDAR_MONTH_NAMES,
  calendarWeekdayNarrow,
  parseYmd,
} from "@/lib/calendar/calendar-grid";

type DeliveryDateStripProps = {
  locale: string;
  dates: readonly string[];
  value: string;
  onChange: (date: string) => void;
};

function toYmd(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function mondayOf(date: string): string {
  const { year, monthIndex, day } = parseYmd(date);
  const utc = new Date(Date.UTC(year, monthIndex, day));
  const weekday = utc.getUTCDay();
  const delta = weekday === 0 ? -6 : 1 - weekday;
  utc.setUTCDate(utc.getUTCDate() + delta);
  return toYmd(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

function addDays(date: string, amount: number): string {
  const { year, monthIndex, day } = parseYmd(date);
  const utc = new Date(Date.UTC(year, monthIndex, day));
  utc.setUTCDate(utc.getUTCDate() + amount);
  return toYmd(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

function monthLabel(locale: string, date: string): string {
  const months =
    locale === "hy"
      ? CALENDAR_MONTH_NAMES.hy
      : locale === "ru"
        ? CALENDAR_MONTH_NAMES.ru
        : CALENDAR_MONTH_NAMES.en;
  return months[parseYmd(date).monthIndex] ?? "";
}

function buildWeeks(dates: readonly string[]): string[][] {
  if (dates.length === 0) return [];
  const sorted = [...dates].sort();
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (!first || !last) return [];
  const weeks: string[][] = [];
  let cursor = mondayOf(first);
  const end = mondayOf(last);
  while (cursor <= end) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(cursor, index)));
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

function weekdayLabel(locale: string, date: string): string {
  const { year, monthIndex, day } = parseYmd(date);
  const utcWeekday = new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
  const mondayFirst = utcWeekday === 0 ? 6 : utcWeekday - 1;
  return calendarWeekdayNarrow(locale)[mondayFirst] ?? "";
}

/** One calendar week at a time, with the month above the days. */
export function DeliveryDateStrip({
  locale,
  dates,
  value,
  onChange,
}: DeliveryDateStripProps) {
  const available = new Set(dates);
  const weeks = buildWeeks(dates);
  const initialWeek = Math.max(
    0,
    weeks.findIndex((week) => week.includes(value)),
  );
  const [weekIndex, setWeekIndex] = useState(initialWeek);
  const [dragX, setDragX] = useState(0);
  const [glide, setGlide] = useState(false);
  const dragStartX = useRef(0);
  const dragStartAt = useRef(0);
  const dragging = useRef(false);
  const visibleWeek = weeks[weekIndex] ?? weeks[0] ?? [];
  const monthSource =
    visibleWeek.find((date) => available.has(date)) ?? visibleWeek[3] ?? value;
  const weekCount = Math.max(weeks.length, 1);

  function endDrag(endX: number): void {
    if (!dragging.current) return;
    dragging.current = false;
    const delta = endX - dragStartX.current;
    const elapsed = Math.max(Date.now() - dragStartAt.current, 1);
    const velocity = delta / elapsed;
    let next = weekIndex;
    if (delta < -24 || velocity < -0.35) next += 1;
    else if (delta > 24 || velocity > 0.35) next -= 1;
    next = Math.min(weeks.length - 1, Math.max(0, next));
    setGlide(true);
    setDragX(0);
    setWeekIndex(next);
  }

  return (
    <div
      className="-mt-1 pb-2"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <p className="mb-4 text-center text-base font-semibold text-gray-900">
        {monthLabel(locale, monthSource)}
      </p>
      <div
        className="overflow-hidden"
        style={{ touchAction: "none" }}
        onPointerDown={(event) => {
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          dragging.current = true;
          dragStartX.current = event.clientX;
          dragStartAt.current = Date.now();
          setGlide(false);
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          setDragX(event.clientX - dragStartX.current);
        }}
        onPointerUp={(event) => endDrag(event.clientX)}
        onPointerCancel={() => endDrag(dragStartX.current)}
      >
        <div
          className="flex"
          style={{
            width: `${weekCount * 100}%`,
            transform: `translate3d(calc(${(-weekIndex * 100) / weekCount}% + ${dragX}px), 0, 0)`,
            transition: glide
              ? "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
        >
          {weeks.map((week) => (
            <div
              key={week[0]}
              className="grid shrink-0 grid-cols-7"
              style={{ width: `${100 / weekCount}%` }}
            >
            {week.map((date) => {
              const bookable = available.has(date);
              const selected = date === value;
              return (
                <button
                  key={date}
                  type="button"
                  disabled={!bookable}
                  onClick={() => onChange(date)}
                  className="flex flex-col items-center disabled:opacity-30"
                >
                  <span
                    className={`mb-2 text-xs font-semibold ${
                      selected ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {weekdayLabel(locale, date)}
                  </span>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold ${
                      selected
                        ? "bg-brand-forest text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {parseYmd(date).day}
                  </span>
                </button>
              );
            })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
