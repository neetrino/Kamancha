import type { DatePickerFieldLabels } from "@/components/ui/DatePickerField";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

/** Shared admin date-picker copy from locale common strings. */
export function getAdminDatePickerLabels(
  common: Dictionary["admin"]["common"],
): DatePickerFieldLabels {
  return {
    placeholder: common.datePicker.placeholder,
    clear: common.clear,
    today: common.datePicker.today,
    weekdays: common.datePicker.weekdaysShort,
  };
}

/** Shared admin date-time picker copy from locale common strings. */
export function getAdminDateTimePickerLabels(
  common: Dictionary["admin"]["common"],
): DatePickerFieldLabels & { time: string } {
  return {
    placeholder: common.datePicker.dateTimePlaceholder,
    clear: common.clear,
    today: common.datePicker.today,
    weekdays: common.datePicker.weekdaysShort,
    time: common.datePicker.time,
  };
}
