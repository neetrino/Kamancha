import "server-only";

import { and, eq } from "drizzle-orm";

import { getProviders } from "@/config/providers";
import { getDb } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { createId } from "@/lib/id";
import {
  extensionForImageMime,
  validateImageFile,
} from "@/lib/media/image-file";
import { logger } from "@/lib/observability/logger";

/** Replaces the cover image for a blog post. */
export async function persistBlogCover(
  postId: string,
  file: File,
): Promise<{ error: string | null }> {
  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: validationError };
  }

  const db = getDb();
  const storage = getProviders().storage;
  const existing = await db
    .select({ objectKey: mediaAssets.objectKey })
    .from(mediaAssets)
    .where(
      and(eq(mediaAssets.blogPostId, postId), eq(mediaAssets.role, "COVER")),
    );

  await db
    .delete(mediaAssets)
    .where(
      and(eq(mediaAssets.blogPostId, postId), eq(mediaAssets.role, "COVER")),
    );

  const id = createId();
  const objectKey = `uploads/blog/${postId}/${id}.${extensionForImageMime(file.type)}`;
  await storage.putObject({
    objectKey,
    body: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
  });

  await db.insert(mediaAssets).values({
    id,
    objectKey,
    mimeType: file.type,
    byteSize: file.size,
    uploadStatus: "READY",
    role: "COVER",
    sortOrder: 0,
    isPrimary: true,
    blogPostId: postId,
  });

  await Promise.all(
    existing.map((row) =>
      storage.deleteObject(row.objectKey).catch((error: unknown) => {
        logger.warn("blog.cover_cleanup_failed", {
          postId,
          message: error instanceof Error ? error.message : "unknown",
        });
      }),
    ),
  );

  return { error: null };
}

/** Deletes stored cover objects after the post row is gone. */
export async function deleteBlogCoverObjects(objectKeys: string[]): Promise<void> {
  const storage = getProviders().storage;
  await Promise.all(
    objectKeys.map((objectKey) =>
      storage.deleteObject(objectKey).catch((error: unknown) => {
        logger.warn("blog.cover_delete_failed", {
          message: error instanceof Error ? error.message : "unknown",
        });
      }),
    ),
  );
}
