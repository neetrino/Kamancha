import { parseYmd } from "@/lib/calendar/calendar-grid";

/** Displays `YYYY-MM-DD` as `DD.MM.YYYY` in the active UI locale. */
export function formatYmdForDisplay(ymd: string): string {
  const { year, monthIndex, day } = parseYmd(ymd);
  return `${String(day).padStart(2, "0")}.${String(monthIndex + 1).padStart(2, "0")}.${year}`;
}
