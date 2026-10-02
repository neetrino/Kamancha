import "server-only";

import { asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db/client";
import {
  deliveryRules,
  type DeliveryZoneTranslationsJson,
} from "@/db/schema";
import type { Locale } from "@/lib/i18n/config";

export type AdminDeliveryLocation = {
  id: string;
  translations: DeliveryZoneTranslationsJson;
  priceAmount: number;
  priority: number;
  label: string;
};

export type CheckoutDeliveryOption = {
  id: string;
  priceAmount: number;
  label: string;
};

const EMPTY_TRANSLATIONS: DeliveryZoneTranslationsJson = {
  hy: { area: "", district: null },
  en: { area: "", district: null },
  ru: { area: "", district: null },
};

function normalizeTranslations(
  value: DeliveryZoneTranslationsJson | null | undefined,
  fallbackCity?: string | null,
  fallbackRegion?: string | null,
): DeliveryZoneTranslationsJson {
  const city = fallbackCity?.trim() || "";
  const region = fallbackRegion?.trim() || null;
  const fallback = city
    ? {
        hy: { area: city, district: region },
        en: { area: city, district: region },
        ru: { area: city, district: region },
      }
    : EMPTY_TRANSLATIONS;

  if (!value || typeof value !== "object") {
    return structuredClone(fallback);
  }

  const next = structuredClone(EMPTY_TRANSLATIONS);
  for (const locale of ["hy", "en", "ru"] as const) {
    const copy = value[locale];
    const area =
      typeof copy?.area === "string" ? copy.area.trim() : fallback[locale].area;
    const districtRaw =
      typeof copy?.district === "string" ? copy.district.trim() : null;
    next[locale] = {
      area: area || fallback[locale].area,
      district: districtRaw || fallback[locale].district,
    };
  }
  return next;
}

/** Builds checkout/admin display label: "Yerevan" or "Shrjanayin (Shengavit)". */
export function formatDeliveryZoneLabel(
  translations: DeliveryZoneTranslationsJson | null | undefined,
  locale: Locale,
  fallbackCity?: string | null,
  fallbackRegion?: string | null,
): string {
  const normalized = normalizeTranslations(
    translations,
    fallbackCity,
    fallbackRegion,
  );
  const copy =
    normalized[locale] ??
    normalized.hy ??
    normalized.en ??
    normalized.ru;
  const area = copy.area.trim();
  const district = copy.district?.trim() || "";
  if (area && district) {
    return `${area} (${district})`;
  }
  return area || district || "Delivery";
}

/** Lists all active delivery zones for the admin table. */
export async function listAdminDeliveryLocations(
  locale: Locale,
): Promise<AdminDeliveryLocation[]> {
  const rows = await getDb()
    .select({
      id: deliveryRules.id,
      city: deliveryRules.city,
      region: deliveryRules.region,
      translations: deliveryRules.translations,
      priceAmount: deliveryRules.priceAmount,
      priority: deliveryRules.priority,
    })
    .from(deliveryRules)
    .where(eq(deliveryRules.isActive, true))
    .orderBy(desc(deliveryRules.priority), asc(deliveryRules.city));

  return rows.map((row) => {
    const translations = normalizeTranslations(
      row.translations,
      row.city,
      row.region,
    );
    return {
      id: row.id,
      translations,
      priceAmount: row.priceAmount,
      priority: row.priority,
      label: formatDeliveryZoneLabel(translations, locale, row.city, row.region),
    };
  });
}

/** Active delivery zones shown in the checkout / group-order zone select. */
export async function listCheckoutDeliveryOptions(
  locale: Locale,
): Promise<CheckoutDeliveryOption[]> {
  const rows = await getDb()
    .select({
      id: deliveryRules.id,
      city: deliveryRules.city,
      region: deliveryRules.region,
      translations: deliveryRules.translations,
      priceAmount: deliveryRules.priceAmount,
    })
    .from(deliveryRules)
    .where(eq(deliveryRules.isActive, true))
    .orderBy(desc(deliveryRules.priority), asc(deliveryRules.city));

  return rows.map((row) => {
    const translations = normalizeTranslations(
      row.translations,
      row.city,
      row.region,
    );
    return {
      id: row.id,
      priceAmount: row.priceAmount,
      label: formatDeliveryZoneLabel(translations, locale, row.city, row.region),
    };
  });
}
