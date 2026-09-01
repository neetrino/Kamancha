const APP_TIME_ZONE = "Asia/Yerevan";

/**
 * Admin table placed/created stamp: time + day-month-year (Asia/Yerevan, SSR-safe).
 */
export function formatAdminPlacedParts(value: string | Date): {
  time: string;
  date: string;
} {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return { time: "—", date: "—" };
  }

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    time: `${get("hour")}:${get("minute")}`,
    date: `${get("day")}.${get("month")}.${get("year")}`,
  };
}
