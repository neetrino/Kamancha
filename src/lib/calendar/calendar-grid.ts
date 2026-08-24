/** Fixed month names — avoids SSR/client `Intl` mismatches for Armenian. */
export const CALENDAR_MONTH_NAMES = {
  en: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  hy: [
    "Հունվար",
    "Փետրվար",
    "Մարտ",
    "Ապրիլ",
    "Մայիս",
    "Հունիս",
    "Հուլիս",
    "Օգոստոս",
    "Սեպտեմբեր",
    "Հոկտեմբեր",
    "Նոյեմբեր",
    "Դեկտեմբեր",
  ],
  ru: [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ],
} as const satisfies Record<"en" | "hy" | "ru", readonly string[]>;

export function calendarMonthLabel(
  year: number,
  monthIndex: number,
  locale: string,
): string {
  let months: readonly string[];
  if (locale === "hy") {
    months = CALENDAR_MONTH_NAMES.hy;
  } else if (locale === "ru") {
    months = CALENDAR_MONTH_NAMES.ru;
  } else {
    months = CALENDAR_MONTH_NAMES.en;
  }
  const month = months[monthIndex] ?? months[0] ?? "";
  return `${month} ${year}`;
}

export function startOfMonthYmd(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function parseYmd(ymd: string): {
  year: number;
  monthIndex: number;
  day: number;
} {
  const [yearText, monthText, dayText] = ymd.split("-");
  return {
    year: Number(yearText),
    monthIndex: Number(monthText) - 1,
    day: Number(dayText),
  };
}

/** Builds a Mon-first month grid (`null` = leading blank). */
export function buildMonthGridCells(
  year: number,
  monthIndex: number,
): Array<string | null> {
  const totalDays = daysInMonth(year, monthIndex);
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const leadingBlanks = firstWeekday === 0 ? 6 : firstWeekday - 1;

  return [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => {
      const day = index + 1;
      return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }),
  ];
}

export type PickerMonthCell = {
  date: string;
  inMonth: boolean;
};

function toYmd(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Six-row picker grid including adjacent-month days (Mon-first). */
export function buildPickerMonthCells(
  year: number,
  monthIndex: number,
): PickerMonthCell[] {
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  const leading = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const cells: PickerMonthCell[] = [];

  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const daysInPrev = daysInMonth(prevYear, prevMonthIndex);
  for (let index = leading - 1; index >= 0; index -= 1) {
    const day = daysInPrev - index;
    cells.push({
      date: toYmd(prevYear, prevMonthIndex, day),
      inMonth: false,
    });
  }

  const daysInCurrent = daysInMonth(year, monthIndex);
  for (let day = 1; day <= daysInCurrent; day += 1) {
    cells.push({ date: toYmd(year, monthIndex, day), inMonth: true });
  }

  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextYear = monthIndex === 11 ? year + 1 : year;
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({
      date: toYmd(nextYear, nextMonthIndex, nextDay),
      inMonth: false,
    });
    nextDay += 1;
  }

  return cells;
}
