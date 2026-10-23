"use client";

import { useMemo, useState } from "react";

import { DeliveryDateStrip } from "@/features/checkout/ui/DeliveryDateStrip";
import { DeliverySlotWheelSheet, DeliverySlotWheels } from "@/features/checkout/ui/DeliverySlotWheelSheet";
import { CHECKOUT_TITLE_INVALID_CLASS } from "@/features/checkout/ui/checkout-ui";
import type {
  DeliveryDayAvailability,
  DeliveryTimeSlot,
} from "@/features/delivery/domain/delivery-schedule";
import { parseYmd } from "@/lib/calendar/calendar-grid";

type DeliverySlotMobileScheduleProps = {
  locale: string;
  disabled: boolean;
  asapLabel: string;
  scheduleLabel: string;
  datePlaceholder: string;
  timePlaceholder: string;
  dayTitle: string;
  timeTitle: string;
  applyLabel: string;
  closeLabel: string;
  asapSelected: boolean;
  hasAsap: boolean;
  days: readonly DeliveryDayAvailability[];
  pickedDate: string | null;
  pickedSlot: DeliveryTimeSlot | null;
  /** Day is chosen, time is still empty, and checkout submit marked the slot invalid. */
  timeInvalid?: boolean;
  onAsap: () => void;
  onDateApplied: (date: string) => void;
  onTimeApplied: (slot: DeliveryTimeSlot) => void;
};

const SHORT_MONTHS = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ru: ["янв.", "февр.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сент.", "окт.", "нояб.", "дек."],
  hy: ["հնվ", "փտվ", "մրտ", "ապր", "մյս", "հնս", "հլս", "օգս", "սպտ", "հկտ", "նյմ", "դկտ"],
} as const;

function shortMonth(locale: string, monthIndex: number): string {
  const names = locale === "hy" ? SHORT_MONTHS.hy : locale === "ru" ? SHORT_MONTHS.ru : SHORT_MONTHS.en;
  return names[monthIndex] ?? "";
}

function formatClock(startTime: string): string {
  const [hour = "", minute = ""] = startTime.split(":");
  return `${hour} : ${minute}`;
}

function slotKey(slot: DeliveryTimeSlot): string {
  return `${slot.startTime}|${slot.endTime}`;
}

const PILL_CLASS =
  "w-full rounded-full bg-white/80 px-4 py-2.5 text-center text-sm font-bold text-brand-forest transition-colors hover:bg-white disabled:opacity-40";

const DATE_TIME_BUTTON_CLASS =
  "w-full whitespace-pre-line rounded-[15px] bg-white px-4 py-2.5 text-center text-sm font-bold text-brand-forest transition-colors hover:bg-white disabled:opacity-40";

/**
 * Phone schedule controls under Change: ASAP, then Schedule, then date and time.
 */
export function DeliverySlotMobileSchedule({
  locale,
  disabled,
  asapLabel,
  scheduleLabel,
  datePlaceholder,
  timePlaceholder,
  dayTitle,
  timeTitle,
  applyLabel,
  closeLabel,
  asapSelected,
  hasAsap,
  days,
  pickedDate,
  pickedSlot,
  timeInvalid = false,
  onAsap,
  onDateApplied,
  onTimeApplied,
}: DeliverySlotMobileScheduleProps) {
  const [scheduling, setScheduling] = useState(!asapSelected && pickedDate !== null);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const seed = parseYmd(pickedDate ?? days[0]?.date ?? "2026-01-01");
  const [draftYear, setDraftYear] = useState(seed.year);
  const [draftMonth, setDraftMonth] = useState(seed.monthIndex);
  const [draftDay, setDraftDay] = useState(seed.day);
  const [draftSlotKey, setDraftSlotKey] = useState<string | null>(null);

  const years = useMemo(
    () => [...new Set(days.map((day) => parseYmd(day.date).year))],
    [days],
  );
  const monthIndexes = useMemo(
    () => [
      ...new Set(
        days
          .filter((day) => parseYmd(day.date).year === draftYear)
          .map((day) => parseYmd(day.date).monthIndex),
      ),
    ],
    [days, draftYear],
  );
  const dayNumbers = useMemo(
    () =>
      days
        .map((day) => parseYmd(day.date))
        .filter(
          (part) => part.year === draftYear && part.monthIndex === draftMonth,
        )
        .map((part) => part.day),
    [days, draftYear, draftMonth],
  );

  const selectedDay = pickedDate
    ? (days.find((day) => day.date === pickedDate) ?? null)
    : null;
  const timeKeys = useMemo(
    () => (selectedDay?.slots ?? []).map(slotKey),
    [selectedDay],
  );
  const dateButtonText = pickedDate
    ? `${parseYmd(pickedDate).day} ${shortMonth(locale, parseYmd(pickedDate).monthIndex)} ${parseYmd(pickedDate).year}`
    : datePlaceholder;
  const timeButtonText = pickedSlot
    ? formatClock(pickedSlot.startTime)
    : timePlaceholder;

  function alignDraft(year: number, monthIndex: number, day: number): void {
    const monthsForYear = [
      ...new Set(
        days
          .filter((entry) => parseYmd(entry.date).year === year)
          .map((entry) => parseYmd(entry.date).monthIndex),
      ),
    ];
    const nextMonth = monthsForYear.includes(monthIndex)
      ? monthIndex
      : (monthsForYear[0] ?? monthIndex);
    const daysForMonth = days
      .map((entry) => parseYmd(entry.date))
      .filter((part) => part.year === year && part.monthIndex === nextMonth)
      .map((part) => part.day);
    const nextDay = daysForMonth.includes(day) ? day : (daysForMonth[0] ?? day);
    setDraftYear(year);
    setDraftMonth(nextMonth);
    setDraftDay(nextDay);
  }

  function openDate(): void {
    const part = parseYmd(pickedDate ?? days[0]?.date ?? "2026-01-01");
    alignDraft(part.year, part.monthIndex, part.day);
    setDateOpen(true);
  }

  function openTime(): void {
    if (!selectedDay || selectedDay.slots.length === 0) {
      openDate();
      return;
    }
    const current =
      pickedSlot &&
      selectedDay.slots.some(
        (slot) =>
          slot.startTime === pickedSlot.startTime &&
          slot.endTime === pickedSlot.endTime,
      )
        ? pickedSlot
        : selectedDay.slots[0];
    setDraftSlotKey(current ? slotKey(current) : null);
    setTimeOpen(true);
  }

  const safeYear = years.includes(draftYear) ? draftYear : (years[0] ?? draftYear);
  const safeMonth = monthIndexes.includes(draftMonth)
    ? draftMonth
    : (monthIndexes[0] ?? draftMonth);
  const safeDay = dayNumbers.includes(draftDay)
    ? draftDay
    : (dayNumbers[0] ?? draftDay);

  function applyDate(): void {
    const match = days.find((day) => {
      const part = parseYmd(day.date);
      return (
        part.year === safeYear &&
        part.monthIndex === safeMonth &&
        part.day === safeDay
      );
    });
    setDateOpen(false);
    if (match) onDateApplied(match.date);
  }

  function applyTime(): void {
    const slot = selectedDay?.slots.find((entry) => slotKey(entry) === draftSlotKey);
    setTimeOpen(false);
    if (slot) onTimeApplied(slot);
  }

  return (
    <div className="max-w-[20.5rem] space-y-3 md:hidden">
      <button
        type="button"
        disabled={disabled || !hasAsap}
        onClick={() => {
          setScheduling(false);
          onAsap();
        }}
        className={`${PILL_CLASS} ${asapSelected ? "ring-2 ring-inset ring-white" : ""}`}
      >
        {asapLabel}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setScheduling(true)}
        className={`${PILL_CLASS} ${scheduling ? "ring-2 ring-inset ring-white" : ""}`}
      >
        {scheduleLabel}
      </button>
      {scheduling ? (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" disabled={disabled} onClick={openDate} className={DATE_TIME_BUTTON_CLASS}>
            {dateButtonText}
          </button>
          <button
            type="button"
            disabled={disabled || !pickedDate}
            onClick={openTime}
            aria-invalid={timeInvalid || undefined}
            className={`${DATE_TIME_BUTTON_CLASS} ${
              timeInvalid ? `${CHECKOUT_TITLE_INVALID_CLASS} ring-2 ring-inset ring-red-500` : ""
            }`}
          >
            {timeButtonText}
          </button>
        </div>
      ) : null}

      <DeliverySlotWheelSheet
        open={dateOpen}
        title={dayTitle}
        applyLabel={applyLabel}
        closeLabel={closeLabel}
        onClose={() => setDateOpen(false)}
        onApply={applyDate}
      >
        <DeliveryDateStrip
          locale={locale}
          dates={days.map((day) => day.date)}
          value={
            days.find((day) => {
              const part = parseYmd(day.date);
              return (
                part.year === safeYear &&
                part.monthIndex === safeMonth &&
                part.day === safeDay
              );
            })?.date ?? days[0]?.date ?? ""
          }
          onChange={(date) => {
            const part = parseYmd(date);
            alignDraft(part.year, part.monthIndex, part.day);
          }}
        />
      </DeliverySlotWheelSheet>

      <DeliverySlotWheelSheet
        open={timeOpen}
        title={timeTitle}
        applyLabel={applyLabel}
        closeLabel={closeLabel}
        onClose={() => setTimeOpen(false)}
        onApply={applyTime}
      >
        {timeKeys.length > 0 ? (
          <DeliverySlotWheels
            value={{ time: draftSlotKey ?? timeKeys[0] ?? "" }}
            columns={[
              {
                name: "time",
                options: timeKeys.map((key) => ({
                  value: key,
                  label: formatClock(key.split("|")[0] ?? ""),
                })),
              },
            ]}
            onChange={(next) => {
              if (next.time) setDraftSlotKey(next.time);
            }}
          />
        ) : null}
      </DeliverySlotWheelSheet>
    </div>
  );
}
