import "server-only";

import { revalidatePath, updateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/cache/tags";
import { locales } from "@/lib/i18n/config";

/** Drops cached public blog pages and the admin list. */
export function revalidateBlog(locale: string): void {
  revalidatePath(`/${locale}/admin/blog`);
  for (const loc of locales) {
    revalidatePath(`/${loc}/blog`, "layout");
  }
  updateTag(CACHE_TAGS.blog);
}
