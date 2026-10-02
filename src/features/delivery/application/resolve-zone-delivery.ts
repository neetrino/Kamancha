import "server-only";

import { and, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import { deliveryRules } from "@/db/schema";
import { getDeliverySettings } from "@/features/delivery/application/get-delivery-settings";
import { formatDeliveryZoneLabel } from "@/features/delivery/application/queries";
import { isDeliveryOfferingEnabled } from "@/features/delivery/domain/delivery-settings";
import type { Locale } from "@/lib/i18n/config";

export type ZoneDeliveryQuote = {
  deliveryRuleId: string;
  zoneName: string;
  deliveryAmount: number;
  countryCode: string;
};

export type ResolveZoneDeliveryResult =
  | { ok: true; quote: ZoneDeliveryQuote }
  | { ok: false; error: string };

/**
 * Resolves a fixed delivery fee for an active zone.
 * Authoritative path for checkout and group-order address save.
 */
export async function resolveZoneDelivery(
  deliveryRuleId: string,
  locale: Locale = "hy",
): Promise<ResolveZoneDeliveryResult> {
  const trimmedId = deliveryRuleId.trim();
  if (!trimmedId) {
    return { ok: false, error: "Select a delivery zone." };
  }

  const settings = await getDeliverySettings();
  if (!isDeliveryOfferingEnabled(settings)) {
    return {
      ok: false,
      error: "Delivery is not configured.",
    };
  }

  const [row] = await getDb()
    .select({
      id: deliveryRules.id,
      city: deliveryRules.city,
      region: deliveryRules.region,
      translations: deliveryRules.translations,
      priceAmount: deliveryRules.priceAmount,
      countryCode: deliveryRules.countryCode,
      isActive: deliveryRules.isActive,
    })
    .from(deliveryRules)
    .where(
      and(eq(deliveryRules.id, trimmedId), eq(deliveryRules.isActive, true)),
    )
    .limit(1);

  if (!row) {
    return { ok: false, error: "Selected delivery zone is no longer available." };
  }

  const zoneName = formatDeliveryZoneLabel(
    row.translations,
    locale,
    row.city,
    row.region,
  );

  return {
    ok: true,
    quote: {
      deliveryRuleId: row.id,
      zoneName,
      deliveryAmount: row.priceAmount,
      countryCode: row.countryCode.trim().toUpperCase().slice(0, 2) || "AM",
    },
  };
}
