"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/client";
import { storeSettings } from "@/db/schema";
import { DELIVERY_SETTING_KEY } from "@/features/delivery/application/get-delivery-settings";
import {
  deliverySettingsSchema,
  type DeliverySettingsInput,
} from "@/features/delivery/schemas";
import { parseDeliverySettings } from "@/features/delivery/domain/delivery-settings";
import { requireAdmin } from "@/lib/auth/policies";
import { getProviders } from "@/config/providers";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

function revalidateDeliveryPaths(locale: string): void {
  revalidatePath(`/${locale}/admin/delivery`);
  revalidatePath(`/${locale}/checkout`);
  revalidatePath(`/${locale}/cart`);
}

function weekdayLabel(
  dayKey: string,
  scheduleCopy: ReturnType<typeof getDictionary>["admin"]["delivery"]["schedule"],
): string {
  switch (dayKey) {
    case "1":
      return scheduleCopy.monday;
    case "2":
      return scheduleCopy.tuesday;
    case "3":
      return scheduleCopy.wednesday;
    case "4":
      return scheduleCopy.thursday;
    case "5":
      return scheduleCopy.friday;
    case "6":
      return scheduleCopy.saturday;
    case "7":
      return scheduleCopy.sunday;
    default:
      return dayKey;
  }
}

/** Saves delivery offering flag, schedule, and cash-change options. */
export async function saveDeliverySettingsAction(
  locale: string,
  raw: DeliverySettingsInput,
): Promise<Result<{ saved: true }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  await requireAdmin(locale as Locale);

  const parsed = deliverySettingsSchema.safeParse(raw);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const scheduleCopy = getDictionary(locale).admin.delivery.schedule;
    const dayKey =
      firstIssue?.path[0] === "schedule" &&
      firstIssue.path[1] === "weekly" &&
      typeof firstIssue.path[2] === "string"
        ? firstIssue.path[2]
        : null;
    const message =
      firstIssue?.message === "Close time must be after open time." && dayKey
        ? scheduleCopy.closeAfterOpen.replace(
            "{day}",
            weekdayLabel(dayKey, scheduleCopy),
          )
        : (firstIssue?.message ?? "Invalid delivery settings.");

    logger.warn("delivery.settings_validation_failed", {
      path: firstIssue?.path.join(".") ?? null,
      message,
      issueCount: parsed.error.issues.length,
    });
    return err("VALIDATION", message);
  }

  const data = parsed.data;
  const now = new Date();
  const [existing] = await getDb()
    .select({ key: storeSettings.key, value: storeSettings.value })
    .from(storeSettings)
    .where(eq(storeSettings.key, DELIVERY_SETTING_KEY))
    .limit(1);

  const previous = parseDeliverySettings(existing?.value ?? null);
  const previousKeys = new Set(
    previous.cashChangeDenominations
      .map((item) => item.imageObjectKey)
      .filter((key): key is string => Boolean(key)),
  );

  const value = {
    // Preserve legacy map-center coords so the address picker keeps a sensible default.
    originLat: previous.mapCenterLat,
    originLng: previous.mapCenterLng,
    isActive: data.isActive,
    schedule: {
      timezone: "Asia/Yerevan" as const,
      ...data.schedule,
    },
    cashChangeDenominations: data.cashChangeDenominations.map((item, index) => ({
      ...item,
      sortOrder: index,
    })),
  };

  const nextKeys = new Set(
    value.cashChangeDenominations
      .map((item) => item.imageObjectKey)
      .filter((key): key is string => Boolean(key)),
  );

  if (existing) {
    await getDb()
      .update(storeSettings)
      .set({ value, updatedAt: now })
      .where(eq(storeSettings.key, DELIVERY_SETTING_KEY));
  } else {
    await getDb().insert(storeSettings).values({
      key: DELIVERY_SETTING_KEY,
      value,
      updatedAt: now,
    });
  }

  const orphanedKeys = [...previousKeys].filter((key) => !nextKeys.has(key));
  if (orphanedKeys.length > 0) {
    const storage = getProviders().storage;
    await Promise.all(
      orphanedKeys.map(async (objectKey) => {
        try {
          await storage.deleteObject(objectKey);
        } catch (error) {
          logger.warn("delivery.cash_change_image_cleanup_failed", {
            objectKey,
            message: error instanceof Error ? error.message : "unknown",
          });
        }
      }),
    );
  }

  revalidateDeliveryPaths(locale);
  return ok({ saved: true });
}
