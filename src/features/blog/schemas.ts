import { z } from "zod";

import { locales } from "@/lib/i18n/config";

const localeCopySchema = z.object({
  title: z.string().trim().max(160),
  excerpt: z.string().trim().max(400),
  body: z.string().trim().max(20_000),
});

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Drawer payload. Image is sent separately as FormData. */
export const upsertBlogSchema = z
  .object({
    slug: z.string().trim().max(80),
    translations: z.object({
      hy: localeCopySchema,
      en: localeCopySchema,
      ru: localeCopySchema,
    }),
  })
  .superRefine((value, ctx) => {
    const complete = locales.filter((locale) => {
      const copy = value.translations[locale];
      return copy.title.length > 0 && copy.body.length > 0;
    });

    if (complete.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one locale needs a title and body.",
        path: ["translations"],
      });
    }

    for (const locale of locales) {
      const copy = value.translations[locale];
      const partial =
        (copy.title.length > 0 || copy.body.length > 0) &&
        (copy.title.length === 0 || copy.body.length === 0);
      if (partial) {
        ctx.addIssue({
          code: "custom",
          message: "Title and body are both required for a locale.",
          path: ["translations", locale],
        });
      }
    }

    if (value.slug.length > 0 && !SLUG_PATTERN.test(value.slug)) {
      ctx.addIssue({
        code: "custom",
        message: "Slug may contain lowercase letters, numbers, and hyphens.",
        path: ["slug"],
      });
    }
  });

export type UpsertBlogInput = z.infer<typeof upsertBlogSchema>;

export const toggleBlogSchema = z.object({
  postId: z.string().uuid(),
  isActive: z.boolean(),
});

export type ToggleBlogInput = z.infer<typeof toggleBlogSchema>;

export const deleteBlogSchema = z.object({
  postId: z.string().uuid(),
});

export type DeleteBlogInput = z.infer<typeof deleteBlogSchema>;
