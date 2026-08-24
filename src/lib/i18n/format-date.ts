import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";

const APP_TIME_ZONE = "Asia/Yerevan";

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const RU_MONTHS = [
  "янв.",
  "февр.",
  "мар.",
  "апр.",
  "мая",
  "июн.",
  "июл.",
  "авг.",
  "сент.",
  "окт.",
  "нояб.",
  "дек.",
] as const;

const HY_MONTHS = [
  "հնվ",
  "փտվ",
  "մրտ",
  "ապր",
  "մյս",
  "հնս",
  "հլս",
  "օգս",
  "սպտ",
  "հկտ",
  "նյմ",
  "դկտ",
] as const;

function calendarParts(value: Date): {
  day: number;
  monthIndex: number;
  year: number;
} {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
  const [yearText, monthText, dayText] = ymd.split("-");
  return {
    year: Number(yearText),
    monthIndex: Number(monthText) - 1,
    day: Number(dayText),
  };
}

function resolveLocale(locale: string): Locale {
  const base = locale.split("-")[0] ?? "en";
  return isLocale(base) ? base : "en";
}

/**
 * Short calendar date in Asia/Yerevan.
 * Uses fixed month names so `hy` does not fall back to the runtime locale.
 */
export function formatShortDate(
  value: Date | string | number,
  locale: string,
): string {
  const date = value instanceof Date ? value : new Date(value);
  const { day, monthIndex, year } = calendarParts(date);
  const appLocale = resolveLocale(locale);

  switch (appLocale) {
    case "en":
      return `${EN_MONTHS[monthIndex]} ${day}, ${year}`;
    case "ru":
      return `${day} ${RU_MONTHS[monthIndex]} ${year} г.`;
    case "hy":
      return `${day} ${HY_MONTHS[monthIndex]}, ${year} թ.`;
  }
}

function formatYerevanTime(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: APP_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(value);
}

/** Short date and local wall time in Asia/Yerevan (e.g. `28 հլս, 2026 թ. · 13:47`). */
export function formatShortDateTime(
  value: Date | string | number,
  locale: string,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return `${formatShortDate(date, locale)} · ${formatYerevanTime(date)}`;
}
