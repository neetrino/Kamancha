"use client";

import {
  DateTimePickerField,
  type DateTimePickerFieldLabels,
} from "@/components/ui/DateTimePickerField";
import { ADMIN_INPUT } from "@/features/admin/ui/admin-form-classes";
import { getAdminDateTimePickerLabels } from "@/features/admin/ui/admin-date-picker-labels";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminDateTimePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  locale: string;
  common: Dictionary["admin"]["common"];
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  name?: string;
  id?: string;
  minDate?: string;
  maxDate?: string;
  isDateEnabled?: (date: string) => boolean;
  labels?: Partial<DateTimePickerFieldLabels>;
};

/** Admin-styled date + time field with shared popover calendar. */
export function AdminDateTimePickerField({
  locale,
  common,
  inputClassName = ADMIN_INPUT,
  labels,
  ...props
}: AdminDateTimePickerFieldProps) {
  return (
    <DateTimePickerField
      {...props}
      locale={locale}
      inputClassName={inputClassName}
      labels={{ ...getAdminDateTimePickerLabels(common), ...labels }}
    />
  );
}
