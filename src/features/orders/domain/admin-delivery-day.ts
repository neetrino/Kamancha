import { formatYerevanDate } from "@/features/delivery/domain/delivery-schedule";

export type AdminDeliveryDayKind = "today" | "tomorrow" | "other" | "none";

/** Adds calendar days to a `YYYY-MM-DD` string (timezone-agnostic). */
export function addCalendarDaysYmd(dateYmd: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateYmd.trim());
  if (!match) return dateYmd;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return `${utc.getUTCFullYear()}-${String(utc.getUTCMonth() + 1).padStart(2, "0")}-${String(utc.getUTCDate()).padStart(2, "0")}`;
}

/** Displays `YYYY-MM-DD` as `DD.MM.YYYY`. */
export function formatYmdDisplay(dateYmd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateYmd.trim());
  if (!match) return dateYmd.trim();
  return `${match[3]}.${match[2]}.${match[1]}`;
}

/** Classifies a scheduled delivery date relative to Asia/Yerevan "today". */
export function classifyAdminDeliveryDay(
  scheduledDeliveryDate: string | null | undefined,
  now: Date = new Date(),
): AdminDeliveryDayKind {
  if (!scheduledDeliveryDate?.trim()) return "none";
  const today = formatYerevanDate(now);
  if (scheduledDeliveryDate === today) return "today";
  if (scheduledDeliveryDate === addCalendarDaysYmd(today, 1)) return "tomorrow";
  return "other";
}

export type AdminOrderDeliveryFields = {
  scheduledDeliveryDate: string | null;
  scheduledDeliveryStart: string | null;
  scheduledDeliveryEnd: string | null;
};

/**
 * Groups orders by scheduled delivery date (null last), preserving input order
 * within each group.
 */
export function groupOrdersByDeliveryDate<T extends AdminOrderDeliveryFields>(
  orders: T[],
): Array<{ date: string | null; orders: T[] }> {
  const groups = new Map<string | null, T[]>();
  const orderKeys: Array<string | null> = [];

  for (const order of orders) {
    const key = order.scheduledDeliveryDate;
    const existing = groups.get(key);
    if (existing) {
      existing.push(order);
      continue;
    }
    groups.set(key, [order]);
    orderKeys.push(key);
  }

  return orderKeys.map((date) => ({
    date,
    orders: groups.get(date) ?? [],
  }));
}
