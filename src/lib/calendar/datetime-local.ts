import { formatYmdForDisplay } from "@/lib/calendar/format-date-display";
import { formatYerevanDate } from "@/features/delivery/domain/delivery-schedule";

export function splitDateTimeLocal(value: string): { date: string; time: string } {
  if (!value.trim()) {
    return { date: "", time: "00:00" };
  }
  const [date, time = "00:00"] = value.split("T");
  return { date, time: time.slice(0, 5) };
}

export function combineDateTimeLocal(date: string, time: string): string {
  if (!date.trim()) {
    return "";
  }
  return `${date}T${time || "00:00"}`;
}

/** Displays `YYYY-MM-DDTHH:mm` as `DD.MM.YYYY HH:mm`. */
export function formatDateTimeLocalForDisplay(value: string): string {
  const { date, time } = splitDateTimeLocal(value);
  if (!date) {
    return "";
  }
  return `${formatYmdForDisplay(date)} ${time}`;
}

export function defaultDateForTimePick(): string {
  return formatYerevanDate(new Date());
}
