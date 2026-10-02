import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { getDb } from "@/db/client";
import { deliveryRules, storeSettings } from "@/db/schema";
import {
  isDeliveryOfferingEnabled,
  parseDeliverySettings,
  type StoreDeliverySettings,
} from "@/features/delivery/domain/delivery-settings";

const DELIVERY_SETTING_KEY = "store.delivery";

export type { StoreDeliverySettings };

const loadDeliverySettings = cache(
  async (): Promise<StoreDeliverySettings> => {
    const [row] = await getDb()
      .select({ value: storeSettings.value })
      .from(storeSettings)
      .where(eq(storeSettings.key, DELIVERY_SETTING_KEY))
      .limit(1);

    return parseDeliverySettings(row?.value ?? null);
  },
);

/** Admin + checkout: current delivery configuration (schedule, cash change, offering). */
export async function getDeliverySettings(): Promise<StoreDeliverySettings> {
  return loadDeliverySettings();
}

/**
 * Whether storefront checkout may offer delivery.
 * Requires the offering flag and at least one active zone.
 */
export async function isCheckoutDeliveryEnabled(): Promise<boolean> {
  const settings = await loadDeliverySettings();
  if (!isDeliveryOfferingEnabled(settings)) {
    return false;
  }

  const [zone] = await getDb()
    .select({ id: deliveryRules.id })
    .from(deliveryRules)
    .where(eq(deliveryRules.isActive, true))
    .limit(1);

  return zone != null;
}

/** @deprecated Use {@link isCheckoutDeliveryEnabled}. */
export async function isCheckoutDistanceDeliveryEnabled(): Promise<boolean> {
  return isCheckoutDeliveryEnabled();
}

export { DELIVERY_SETTING_KEY };
