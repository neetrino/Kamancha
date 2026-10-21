import "server-only";

import type { BlogTranslationsJson } from "@/db/schema/blog";
import { locales } from "@/lib/i18n/config";
import {
  upsertBlogSchema,
  type UpsertBlogInput,
} from "@/features/blog/schemas";

/** Parses the drawer JSON payload. */
export function parseBlogFormData(formData: FormData): UpsertBlogInput | null {
  const raw = formData.get("data");
  if (typeof raw !== "string") {
    return null;
  }

  let json: unknown;
  try {
    json = JSON.parse(raw) as unknown;
  } catch {
    return null;
  }

  const parsed = upsertBlogSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

/** Keeps only locales that have both a title and a body. */
export function compactBlogTranslations(
  input: UpsertBlogInput["translations"],
): BlogTranslationsJson {
  const translations: BlogTranslationsJson = {};

  for (const locale of locales) {
    const copy = input[locale];
    if (!copy.title || !copy.body) {
      continue;
    }

    translations[locale] = {
      title: copy.title,
      body: copy.body,
      ...(copy.excerpt ? { excerpt: copy.excerpt } : {}),
    };
  }

  return translations;
}

/** First complete title, used when the slug field is empty. */
export function firstBlogTitle(input: UpsertBlogInput["translations"]): string {
  for (const locale of locales) {
    const title = input[locale].title;
    if (title) {
      return title;
    }
  }

  return "post";
}
