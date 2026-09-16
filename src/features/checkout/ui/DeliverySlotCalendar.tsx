import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  calendarMonthLabel,
  calendarWeekdayNarrow,
} from "@/lib/calendar/calendar-grid";

const MONTH_NAV_BUTTON =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-white/80 hover:text-gray-800 disabled:opacity-30";

function dayButtonClass(
  isSelected: boolean,
  bookable: boolean,
  isToday: boolean,
): string {
  const base =
    "mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors";
  if (isSelected) {
    return `${base} bg-brand-forest font-semibold text-white`;
  }
  if (!bookable) {
    return `${base} cursor-not-allowed bg-white/50 text-gray-300`;
  }
  return `${base} bg-white/80 text-gray-900 hover:bg-white ${
    isToday ? "font-bold" : "font-medium"
  }`;
}

type CalendarDayCellsProps = {
  cells: Array<string | null>;
  todayYmd: string;
  selectedDate: string | null;
  disabled: boolean;
  isBookable: (date: string) => boolean;
  onSelectDate: (date: string) => void;
};

function CalendarDayCells({
  cells,
  todayYmd,
  selectedDate,
  disabled,
  isBookable,
  onSelectDate,
}: CalendarDayCellsProps) {
  return (
    <>
      {cells.map((date, index) => {
        if (!date) {
          return <div key={`blank-${index}`} />;
        }
        const bookable = isBookable(date);
        return (
          <button
            key={date}
            type="button"
            disabled={disabled || !bookable}
            onClick={() => onSelectDate(date)}
            className={dayButtonClass(
              selectedDate === date,
              bookable,
              date === todayYmd,
            )}
          >
            {Number(date.slice(-2))}
          </button>
        );
      })}
    </>
  );
}

export type DeliverySlotCalendarProps = {
  locale: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  viewYear: number;
  viewMonth: number;
  cells: Array<string | null>;
  todayYmd: string;
  selectedDate: string | null;
  disabled: boolean;
  canPrev: boolean;
  canNext: boolean;
  isBookable: (date: string) => boolean;
  onShiftMonth: (delta: number) => void;
  onSelectDate: (date: string) => void;
};

/** Inline month grid for checkout delivery-day selection. */
export function DeliverySlotCalendar({
  locale,
  prevMonthLabel,
  nextMonthLabel,
  viewYear,
  viewMonth,
  cells,
  todayYmd,
  selectedDate,
  disabled,
  canPrev,
  canNext,
  isBookable,
  onShiftMonth,
  onSelectDate,
}: DeliverySlotCalendarProps) {
  return (
    <div className="w-full max-w-[20.5rem] rounded-[20px] bg-white/90 px-3 py-3 sm:px-4">
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          disabled={disabled || !canPrev}
          onClick={() => onShiftMonth(-1)}
          aria-label={prevMonthLabel}
          className={MONTH_NAV_BUTTON}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <p className="text-sm capitalize text-gray-600">
          {calendarMonthLabel(viewYear, viewMonth, locale)}
        </p>
        <button
          type="button"
          disabled={disabled || !canNext}
          onClick={() => onShiftMonth(1)}
          aria-label={nextMonthLabel}
          className={MONTH_NAV_BUTTON}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {calendarWeekdayNarrow(locale).map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="py-1 text-xs font-medium text-gray-400"
          >
            {label}
          </div>
        ))}
        <CalendarDayCells
          cells={cells}
          todayYmd={todayYmd}
          selectedDate={selectedDate}
          disabled={disabled}
          isBookable={isBookable}
          onSelectDate={onSelectDate}
        />
      </div>
    </div>
  );
}
