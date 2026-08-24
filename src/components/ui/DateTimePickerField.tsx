"use client";

import { CalendarDays } from "lucide-react";
import type { ReactNode } from "react";

import { DatePickerField, type DatePickerFieldLabels } from "@/components/ui/DatePickerField";
import {
  combineDateTimeLocal,
  defaultDateForTimePick,
  formatDateTimeLocalForDisplay,
  splitDateTimeLocal,
} from "@/lib/calendar/datetime-local";

export type DateTimePickerFieldLabels = DatePickerFieldLabels & {
  time: string;
};

type DateTimePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  locale: string;
  labels: DateTimePickerFieldLabels;
  name?: string;
  id?: string;
  minDate?: string;
  maxDate?: string;
  isDateEnabled?: (date: string) => boolean;
};

/** Popover date + time field (`YYYY-MM-DDTHH:mm`). */
export function DateTimePickerField({
  value,
  onChange,
  disabled = false,
  className = "",
  inputClassName = "",
  locale,
  labels,
  name,
  id,
  minDate,
  maxDate,
  isDateEnabled,
}: DateTimePickerFieldProps) {
  const { date, time } = splitDateTimeLocal(value);
  const displayValue = formatDateTimeLocalForDisplay(value);

  function updateDate(nextDate: string): void {
    if (!nextDate) {
      onChange("");
      return;
    }
    onChange(combineDateTimeLocal(nextDate, time || "00:00"));
  }

  function updateTime(nextTime: string): void {
    const nextDate = date || defaultDateForTimePick();
    onChange(combineDateTimeLocal(nextDate, nextTime));
  }

  const timeFooter: ReactNode = (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">
        {labels.time}
      </span>
      <input
        type="time"
        disabled={disabled}
        value={time}
        onChange={(event) => updateTime(event.target.value)}
        className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition-colors hover:border-gray-300 focus:border-gray-300"
      />
    </label>
  );

  return (
    <>
      <DatePickerField
        value={date}
        onChange={updateDate}
        disabled={disabled}
        className={className}
        inputClassName={inputClassName}
        locale={locale}
        labels={labels}
        id={id}
        closeOnSelect={false}
        minDate={minDate}
        maxDate={maxDate}
        isDateEnabled={isDateEnabled}
        footer={timeFooter}
        renderTrigger={({ id: fieldId, open, disabled: triggerDisabled, onClick }) => (
          <button
            id={fieldId}
            type="button"
            disabled={triggerDisabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={onClick}
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
      />
      {name ? <input type="hidden" name={name} value={value} /> : null}
    </>
  );
}
