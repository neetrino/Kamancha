"use client";

import { useEffect, useMemo, useState } from "react";

import { DeliverySlotCalendar } from "@/features/checkout/ui/DeliverySlotCalendar";
import { DeliverySlotSummary } from "@/features/checkout/ui/DeliverySlotSummary";
import { CheckoutRadio } from "@/features/checkout/ui/CheckoutRadio";
import {
  formatYerevanDate,
  isSameDeliverySlot,
  listAvailableDeliveryDays,
  resolveEarliestDeliverySlot,
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
  deliverTo: string;
  approximatelyOneHour: string;
  change: string;
  asapOption: string;
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

const SUMMARY_CARD_CLASS =
  "rounded-2xl border border-gray-200/80 bg-white px-4 py-4 shadow-sm sm:px-5";

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
  onSelect: (value: SelectedDeliverySlot) => void,
): void {
  if (!day || disabled) return;
  const first = day.slots[0];
  if (!first) return;
  onSelect({
    date: day.date,
    startTime: first.startTime,
    endTime: first.endTime,
  });
}

/**
 * Default ASAP (~1 hour) summary; Change reveals calendar + time slots.
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
  const asapSlot = useMemo(
    () => resolveEarliestDeliverySlot(schedule),
    [schedule],
  );
  const availableByDate = useMemo(() => {
    const map = new Map<string, DeliveryDayAvailability>();
    for (const day of availableDays) {
      map.set(day.date, day);
    }
    return map;
  }, [availableDays]);

  const [isEditing, setIsEditing] = useState(false);
  const [useAsap, setUseAsap] = useState(true);

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

  useEffect(() => {
    if (disabled || !asapSlot) return;
    if (selected == null) {
      setUseAsap(true);
      onChange(asapSlot);
    }
  }, [asapSlot, disabled, onChange, selected]);

  function shiftMonth(delta: number): void {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  }

  function applyAsap(): void {
    if (!asapSlot || disabled) return;
    setUseAsap(true);
    onChange(asapSlot);
    setIsEditing(false);
  }

  function applyCustomSlot(value: SelectedDeliverySlot): void {
    setUseAsap(false);
    onChange(value);
    setIsEditing(false);
  }

  if (availableDays.length === 0) {
    return (
      <div data-checkout-field="deliverySlot" className={SUMMARY_CARD_CLASS}>
        <h3 className="mb-3 text-base font-semibold text-gray-900">
          {labels.title}
        </h3>
        <p className="text-sm text-red-700">{labels.noSlots}</p>
      </div>
    );
  }

  const asapSelected = useAsap && isSameDeliverySlot(selected, asapSlot);

  return (
    <div
      data-checkout-field="deliverySlot"
      className={`relative z-[2] ${SUMMARY_CARD_CLASS}`}
    >
      <h3 className="mb-3 text-base font-semibold text-gray-900">
        {labels.title}
      </h3>
      <DeliverySlotSummary
        labels={labels}
        useAsap={useAsap}
        selected={selected}
        disabled={disabled}
        onChangeClick={() => setIsEditing((open) => !open)}
      />

      {isEditing ? (
        <div className="mt-5 grid grid-cols-1 gap-6 border-t border-gray-100 pt-5 lg:grid-cols-2 lg:items-start lg:gap-8">
          <div className="space-y-3">
            <button
              type="button"
              disabled={disabled || !asapSlot}
              onClick={applyAsap}
              className={`w-full rounded-full px-4 py-3 text-left text-sm font-medium transition-colors ${
                asapSelected
                  ? "bg-brand-forest text-white"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200"
              }`}
            >
              {labels.asapOption}
            </button>
            <DeliverySlotCalendar
              locale={locale}
              prevMonthLabel={labels.prevMonth}
              nextMonthLabel={labels.nextMonth}
              viewYear={viewYear}
              viewMonth={viewMonth}
              cells={buildMonthGridCells(viewYear, viewMonth)}
              todayYmd={todayYmd}
              selectedDate={useAsap ? null : (selected?.date ?? null)}
              disabled={disabled}
              canPrev={viewMonthYmd > minMonth}
              canNext={viewMonthYmd < maxMonth}
              isBookable={(date) => availableByDate.has(date)}
              onShiftMonth={shiftMonth}
              onSelectDate={(date) =>
                selectFirstSlot(availableByDate.get(date), disabled, (slot) => {
                  setUseAsap(false);
                  onChange(slot);
                })
              }
            />
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">
              {labels.pickTime}
            </h4>
            {selectedDay && !useAsap ? (
              <DeliveryTimeSlotList
                day={selectedDay}
                selected={selected}
                disabled={disabled}
                onChange={applyCustomSlot}
              />
            ) : (
              <p className="text-sm text-gray-500">{labels.pickDate}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
