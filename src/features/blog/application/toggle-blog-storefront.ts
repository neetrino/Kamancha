"use server";

import { upsertStoreSettingAction } from "@/features/settings/application/upsert-settings";
import { err, ok, type Result } from "@/lib/result";

type ToggleBlogStorefrontInput = {
  enabled: boolean;
};

/**
 * Turns storefront `/blog` on or off (footer link + public routes).
 */
export async function toggleBlogStorefrontAction(
  locale: string,
  input: ToggleBlogStorefrontInput,
): Promise<Result<{ enabled: boolean }>> {
  const result = await upsertStoreSettingAction(locale, {
    key: "store.blog",
    value: { enabled: input.enabled },
  });

  if (!result.ok) {
    return err(result.error.code, result.error.message);
  }

  return ok({ enabled: input.enabled });
}
