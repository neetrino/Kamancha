"use server";

import {
  archiveAttributeOption,
  createAttributeOption,
} from "@/features/attributes/application/library";
import type { AttributeOption } from "@/features/attributes/types";
import { requireAdmin } from "@/lib/auth/policies";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { err, ok, type Result } from "@/lib/result";

/** Adds a named option in Armenian, English, and Russian. */
export async function createAttributeAction(
  locale: string,
  titles: { hy: string; en: string; ru: string },
): Promise<Result<AttributeOption>> {
  if (!isLocale(locale)) return err("INVALID_LOCALE", "Invalid locale.");
  await requireAdmin(locale as Locale);
  const created = await createAttributeOption(titles, locale);
  if (!created) {
    return err("VALIDATION_ERROR", "Armenian, English, and Russian names are required.");
  }
  return ok(created);
}

/** Removes an option from the picker and from products. */
export async function deleteAttributeAction(
  locale: string,
  attributeId: string,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) return err("INVALID_LOCALE", "Invalid locale.");
  await requireAdmin(locale as Locale);
  const removed = await archiveAttributeOption(attributeId);
  if (!removed) return err("NOT_FOUND", "Attribute not found.");
  return ok({ id: attributeId });
}
