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
import { requireAdmin } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { geocodeAddress } from "@/lib/maps/google-maps";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

function revalidateDeliveryPaths(locale: string): void {
  revalidatePath(`/${locale}/admin/delivery`);
  revalidatePath(`/${locale}/checkout`);
  revalidatePath(`/${locale}/cart`);
}

/** Saves store origin + AMD/km after geocoding the origin address. */
export async function saveDeliverySettingsAction(
  locale: string,
  raw: DeliverySettingsInput,
): Promise<Result<{ originAddress: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  await requireAdmin(locale as Locale);

  const parsed = deliverySettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION", "Invalid delivery settings.");
  }

  const data = parsed.data;

  let originLat: number;
  let originLng: number;
  let formattedAddress: string;
  try {
    const geocoded = await geocodeAddress(data.originAddress);
    originLat = geocoded.location.lat;
    originLng = geocoded.location.lng;
    formattedAddress = geocoded.formattedAddress;
  } catch (error) {
    logger.warn("delivery.origin_geocode_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return err(
      "GEOCODE_FAILED",
      error instanceof Error
        ? error.message
        : "Store address could not be found on the map.",
    );
  }

  const value = {
    originAddress: formattedAddress,
    originLat,
    originLng,
    pricePerKmAmount: data.pricePerKmAmount,
    isActive: data.isActive,
  };

  const now = new Date();
  const [existing] = await getDb()
    .select({ key: storeSettings.key })
    .from(storeSettings)
    .where(eq(storeSettings.key, DELIVERY_SETTING_KEY))
    .limit(1);

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

  revalidateDeliveryPaths(locale);
  return ok({ originAddress: formattedAddress });
}
