"use client";

import { useMemo, useState } from "react";

import { DeliverySlotCalendar } from "@/features/checkout/ui/DeliverySlotCalendar";
import { CheckoutRadio } from "@/features/checkout/ui/CheckoutRadio";
import {
  formatYerevanDate,
  listAvailableDeliveryDays,
  type DeliveryDayAvailability,
  type DeliveryScheduleSettings,
  type DeliveryTimeSlot,
  type SelectedDeliverySlot,
} from "@/features/delivery/domain/delivery-schedule";
import {
  buildMonthGridCells,
  parseYmd,
  startOfMonthYmd,
} from "@/lib/calendar/calendar-grid";

type DeliverySlotPickerLabels = {
  title: string;
  pickDate: string;
  pickTime: string;
  noSlots: string;
  prevMonth: string;
  nextMonth: string;
};

type DeliverySlotPickerProps = {
  schedule: DeliveryScheduleSettings;
  selected: SelectedDeliverySlot | null;
  onChange: (value: SelectedDeliverySlot | null) => void;
  disabled?: boolean;
  labels: DeliverySlotPickerLabels;
  locale: string;
};

const PICKER_HEADING_CLASS = "mb-3 text-base font-semibold text-white";

function slotCardClass(isSelected: boolean): string {
  const base =
    "flex min-w-0 w-full cursor-pointer items-center rounded-full py-3 pr-3 pl-2 text-sm text-gray-900 transition-colors";
  if (isSelected) {
    return `${base} bg-white ring-2 ring-inset ring-brand-forest`;
  }
  return `${base} bg-white/80 hover:bg-white`;
}

function isSlotSelected(
  selected: SelectedDeliverySlot | null,
  slot: DeliveryTimeSlot,
): boolean {
  return (
    selected?.startTime === slot.startTime &&
    selected?.endTime === slot.endTime
  );
}

type TimeSlotListProps = {
  day: DeliveryDayAvailability;
  selected: SelectedDeliverySlot | null;
  disabled: boolean;
  onChange: (value: SelectedDeliverySlot) => void;
};

function DeliveryTimeSlotList({
  day,
  selected,
  disabled,
  onChange,
}: TimeSlotListProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {day.slots.map((slot) => {
        const isSelected = isSlotSelected(selected, slot);
        return (
          <label key={slot.label} className={slotCardClass(isSelected)}>
            <CheckoutRadio
              name="deliveryTimeSlot"
              value={`${slot.startTime}-${slot.endTime}`}
              checked={isSelected}
              disabled={disabled}
              onChange={() =>
                onChange({
                  date: day.date,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                })
              }
              className="relative z-[2] !mr-0"
            />
            <span className="relative z-[2] min-w-0 flex-1 text-center font-medium">
              {slot.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

function selectFirstSlot(
  day: DeliveryDayAvailability | undefined,
  disabled: boolean,
  onChange: (value: SelectedDeliverySlot | null) => void,
): void {
  if (!day || disabled) return;
  const first = day.slots[0];
  if (!first) {
    onChange(null);
    return;
  }
  onChange({
    date: day.date,
    startTime: first.startTime,
    endTime: first.endTime,
  });
}

/**
 * Calendar + time-slot picker for checkout delivery scheduling.
 */
export function DeliverySlotPicker({
  schedule,
  selected,
  onChange,
  disabled = false,
  labels,
  locale,
}: DeliverySlotPickerProps) {
  const availableDays = useMemo(
    () => listAvailableDeliveryDays(schedule),
    [schedule],
  );
  const availableByDate = useMemo(() => {
    const map = new Map<string, DeliveryDayAvailability>();
    for (const day of availableDays) {
      map.set(day.date, day);
    }
    return map;
  }, [availableDays]);

  const todayYmd = formatYerevanDate(new Date());
  const todayParts = parseYmd(todayYmd);
  const [viewYear, setViewYear] = useState(todayParts.year);
  const [viewMonth, setViewMonth] = useState(todayParts.monthIndex);
  const selectedDay = selected
    ? availableByDate.get(selected.date) ?? null
    : null;
  const lastDate = availableDays[availableDays.length - 1]?.date ?? todayYmd;
  const minMonth = startOfMonthYmd(todayParts.year, todayParts.monthIndex);
  const maxMonth = startOfMonthYmd(
    parseYmd(lastDate).year,
    parseYmd(lastDate).monthIndex,
  );
  const viewMonthYmd = startOfMonthYmd(viewYear, viewMonth);

  function shiftMonth(delta: number): void {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  }

  if (availableDays.length === 0) {
    return (
      <p className="relative z-[2] text-sm text-red-700">{labels.noSlots}</p>
    );
  }

  return (
    <div className="relative z-[2] grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-10">
      <div>
        <h3 className={PICKER_HEADING_CLASS}>{labels.title}</h3>
        <DeliverySlotCalendar
          locale={locale}
          prevMonthLabel={labels.prevMonth}
          nextMonthLabel={labels.nextMonth}
          viewYear={viewYear}
          viewMonth={viewMonth}
          cells={buildMonthGridCells(viewYear, viewMonth)}
          todayYmd={todayYmd}
          selectedDate={selected?.date ?? null}
          disabled={disabled}
          canPrev={viewMonthYmd > minMonth}
          canNext={viewMonthYmd < maxMonth}
          isBookable={(date) => availableByDate.has(date)}
          onShiftMonth={shiftMonth}
          onSelectDate={(date) =>
            selectFirstSlot(availableByDate.get(date), disabled, onChange)
          }
        />
      </div>
      <div>
        <h3 className={PICKER_HEADING_CLASS}>{labels.pickTime}</h3>
        {selectedDay ? (
          <DeliveryTimeSlotList
            day={selectedDay}
            selected={selected}
            disabled={disabled}
            onChange={onChange}
          />
        ) : (
          <p className="text-sm text-white/80">{labels.pickDate}</p>
        )}
      </div>
    </div>
  );
}
