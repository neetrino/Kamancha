import "server-only";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { getDb } from "@/db/client";
import {
  blogPosts,
  mediaAssets,
  type BlogTranslationsJson,
} from "@/db/schema";
import { pickBlogCopy } from "@/features/blog/domain/blog-copy";
import {
  CACHE_TAGS,
  PUBLIC_CACHE_REVALIDATE_SECONDS,
} from "@/lib/cache/tags";
import type { Locale } from "@/lib/i18n/config";
import { mediaPublicUrl } from "@/lib/media/public-url";

export type AdminBlogListItem = {
  id: string;
  slug: string;
  title: string;
  translations: BlogTranslationsJson;
  isActive: boolean;
  imageUrl: string | null;
  publishedAt: string | null;
};

export type StorefrontBlogCard = {
  slug: string;
  title: string;
  imageUrl: string;
};

export type StorefrontBlogPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  imageUrl: string;
  publishedAt: string | null;
};

async function loadCoverUrls(postIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (postIds.length === 0) {
    return map;
  }

  const rows = await getDb()
    .select({
      blogPostId: mediaAssets.blogPostId,
      objectKey: mediaAssets.objectKey,
    })
    .from(mediaAssets)
    .where(
      and(
        inArray(mediaAssets.blogPostId, postIds),
        eq(mediaAssets.uploadStatus, "READY"),
        eq(mediaAssets.role, "COVER"),
      ),
    );

  for (const row of rows) {
    if (row.blogPostId) {
      map.set(row.blogPostId, mediaPublicUrl(row.objectKey));
    }
  }

  return map;
}

function listTitle(translations: BlogTranslationsJson, slug: string): string {
  return pickBlogCopy(translations, "hy")?.title ?? slug;
}

/** All posts for the admin list, newest first. */
export async function listAdminBlogPosts(): Promise<AdminBlogListItem[]> {
  const rows = await getDb()
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt));
  const images = await loadCoverUrls(rows.map((row) => row.id));

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: listTitle(row.translations, row.slug),
    translations: row.translations,
    isActive: row.isActive,
    imageUrl: images.get(row.id) ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  }));
}

async function loadPublishedCards(locale: Locale): Promise<StorefrontBlogCard[]> {
  const rows = await getDb()
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isActive, true))
    .orderBy(
      sql`${blogPosts.publishedAt} DESC NULLS LAST`,
      desc(blogPosts.createdAt),
    );
  const images = await loadCoverUrls(rows.map((row) => row.id));
  const cards: StorefrontBlogCard[] = [];

  for (const row of rows) {
    const copy = pickBlogCopy(row.translations, locale);
    const imageUrl = images.get(row.id);
    if (!copy || !imageUrl) {
      continue;
    }
    cards.push({ slug: row.slug, title: copy.title, imageUrl });
  }

  return cards;
}

/** Active posts that have a cover and a title for the storefront grid. */
export async function listPublishedBlogPosts(
  locale: Locale,
): Promise<StorefrontBlogCard[]> {
  return unstable_cache(
    async () => loadPublishedCards(locale),
    ["published-blog-posts", locale],
    {
      tags: [CACHE_TAGS.blog],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}

async function loadPublishedPost(
  locale: Locale,
  slug: string,
): Promise<StorefrontBlogPost | null> {
  const [row] = await getDb()
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isActive, true)))
    .limit(1);

  if (!row) {
    return null;
  }

  const copy = pickBlogCopy(row.translations, locale);
  const images = await loadCoverUrls([row.id]);
  const imageUrl = images.get(row.id);
  if (!copy || !imageUrl) {
    return null;
  }

  return {
    slug: row.slug,
    title: copy.title,
    excerpt: copy.excerpt ?? null,
    body: copy.body,
    imageUrl,
    publishedAt: row.publishedAt?.toISOString() ?? null,
  };
}

/** One published post by slug, or null when missing or inactive. */
export async function getPublishedBlogPost(
  locale: Locale,
  slug: string,
): Promise<StorefrontBlogPost | null> {
  return unstable_cache(
    async () => loadPublishedPost(locale, slug),
    ["published-blog-post", locale, slug],
    {
      tags: [CACHE_TAGS.blog],
      revalidate: PUBLIC_CACHE_REVALIDATE_SECONDS,
    },
  )();
}
