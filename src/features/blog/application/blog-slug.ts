import "server-only";

import { and, eq, ne } from "drizzle-orm";

import { blogPosts } from "@/db/schema";
import type { DbTransaction } from "@/db/transaction";
import { slugifyTitle } from "@/features/blog/domain/blog-copy";

/** Picks a unique slug, suffixing when the base is already taken. */
export async function allocateBlogSlug(
  tx: DbTransaction,
  preferred: string,
  fallbackTitle: string,
  excludeId?: string,
): Promise<string> {
  const base =
    slugifyTitle(preferred) || slugifyTitle(fallbackTitle) || "post";
  let candidate = base;

  for (let suffix = 2; suffix < 50; suffix += 1) {
    const filters = excludeId
      ? and(eq(blogPosts.slug, candidate), ne(blogPosts.id, excludeId))
      : eq(blogPosts.slug, candidate);
    const [row] = await tx
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(filters)
      .limit(1);

    if (!row) {
      return candidate;
    }

    candidate = `${base}-${suffix}`.slice(0, 80);
  }

  throw new Error("SLUG_CONFLICT");
}
