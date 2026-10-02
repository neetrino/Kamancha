"use server";

import { eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db/client";
import { deliveryRules } from "@/db/schema";
import {
  deliveryLocationSchema,
  type DeliveryLocationInput,
} from "@/features/delivery/schemas";
import { requireAdmin } from "@/lib/auth/policies";
import { createId } from "@/lib/id";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

const DEFAULT_COUNTRY_CODE = "AM";

function revalidateDelivery(locale: string): void {
  revalidatePath(`/${locale}/admin/delivery`);
  revalidatePath(`/${locale}/checkout`);
  revalidatePath(`/${locale}/cart`);
}

/** Creates a delivery zone for checkout pricing. */
export async function createDeliveryLocationAction(
  locale: string,
  raw: DeliveryLocationInput,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  await requireAdmin(locale as Locale);

  const parsed = deliveryLocationSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION", "Invalid delivery zone.");
  }

  const data = parsed.data;
  const [maxPriority] = await getDb()
    .select({ value: max(deliveryRules.priority) })
    .from(deliveryRules);

  const id = createId();
  await getDb().insert(deliveryRules).values({
    id,
    countryCode: DEFAULT_COUNTRY_CODE,
    city: data.translations.hy.area.trim(),
    region: data.translations.hy.district?.trim() || null,
    translations: data.translations,
    priceAmount: data.priceAmount,
    freeThresholdAmount: null,
    isActive: true,
    priority: (maxPriority?.value ?? 0) + 1,
  });

  revalidateDelivery(locale);
  return ok({ id });
}

/** Updates an existing delivery zone. */
export async function updateDeliveryLocationAction(
  locale: string,
  id: string,
  raw: DeliveryLocationInput,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  await requireAdmin(locale as Locale);

  const parsed = deliveryLocationSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION", "Invalid delivery zone.");
  }

  const data = parsed.data;
  const [existing] = await getDb()
    .select({ id: deliveryRules.id })
    .from(deliveryRules)
    .where(eq(deliveryRules.id, id))
    .limit(1);

  if (!existing) {
    return err("NOT_FOUND", "Delivery zone not found.");
  }

  await getDb()
    .update(deliveryRules)
    .set({
      city: data.translations.hy.area.trim(),
      region: data.translations.hy.district?.trim() || null,
      translations: data.translations,
      priceAmount: data.priceAmount,
      updatedAt: new Date(),
    })
    .where(eq(deliveryRules.id, id));

  revalidateDelivery(locale);
  return ok({ id });
}

/** Soft-deactivates a delivery zone (keeps order history references). */
export async function deleteDeliveryLocationAction(
  locale: string,
  id: string,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  await requireAdmin(locale as Locale);

  const [existing] = await getDb()
    .select({ id: deliveryRules.id })
    .from(deliveryRules)
    .where(eq(deliveryRules.id, id))
    .limit(1);

  if (!existing) {
    return err("NOT_FOUND", "Delivery zone not found.");
  }

  await getDb()
    .update(deliveryRules)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(deliveryRules.id, id));

  revalidateDelivery(locale);
  return ok({ id });
}
