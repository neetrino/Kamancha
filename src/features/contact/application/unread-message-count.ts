"use server";

import { count, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

/** Counts contact messages still marked unread. */
export async function getUnreadContactMessageCountAction(
  locale: string,
): Promise<Result<{ unreadCount: number }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }
  await requireAdmin(locale as Locale);

  const [row] = await getDb()
    .select({ unreadCount: count() })
    .from(contactMessages)
    .where(eq(contactMessages.status, "UNREAD"));

  return ok({ unreadCount: row?.unreadCount ?? 0 });
}
