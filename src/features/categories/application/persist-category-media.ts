import "server-only";

import { eq } from "drizzle-orm";

import { getProviders } from "@/config/providers";
import { getDb } from "@/db/client";
import { mediaAssets } from "@/db/schema";
import { createId } from "@/lib/id";
import {
  extensionForImageMime,
  MEDIA_IMAGE_MAX_BYTES,
  resolveImageMimeType,
  validateImageFile,
} from "@/lib/media/image-file";

/** Saves a single primary image for a category via object storage. */
export async function persistCategoryImage(
  categoryId: string,
  file: Blob,
): Promise<{ error: string | null }> {
  const fileName = file instanceof File ? file.name : undefined;
  const validationError = validateImageFile(file, MEDIA_IMAGE_MAX_BYTES, fileName);
  if (validationError) {
    return { error: validationError };
  }

  const mimeType = resolveImageMimeType(file, fileName);
  if (!mimeType) {
    return { error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }

  const db = getDb();
  const storage = getProviders().storage;
  const existing = await db
    .select({ id: mediaAssets.id, objectKey: mediaAssets.objectKey })
    .from(mediaAssets)
    .where(eq(mediaAssets.categoryId, categoryId));

  if (existing.length > 0) {
    await db.delete(mediaAssets).where(eq(mediaAssets.categoryId, categoryId));
    await Promise.all(
      existing.map((row) => storage.deleteObject(row.objectKey)),
    );
  }

  const id = createId();
  const objectKey = `uploads/categories/${categoryId}/${id}.${extensionForImageMime(mimeType)}`;
  await storage.putObject({
    objectKey,
    body: Buffer.from(await file.arrayBuffer()),
    contentType: mimeType,
  });

  await db.insert(mediaAssets).values({
    id,
    objectKey,
    mimeType,
    byteSize: file.size,
    uploadStatus: "READY",
    role: "PRIMARY",
    sortOrder: 0,
    isPrimary: true,
    categoryId,
  });

  return { error: null };
}

/** Removes all media rows for a category and deletes stored objects. */
export async function removeCategoryImage(categoryId: string): Promise<void> {
  const db = getDb();
  const storage = getProviders().storage;
  const existing = await db
    .select({ objectKey: mediaAssets.objectKey })
    .from(mediaAssets)
    .where(eq(mediaAssets.categoryId, categoryId));

  await db.delete(mediaAssets).where(eq(mediaAssets.categoryId, categoryId));
  await Promise.all(existing.map((row) => storage.deleteObject(row.objectKey)));
}
