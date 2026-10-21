"use server";

import { eq } from "drizzle-orm";

import { auditLogs, blogPosts, mediaAssets } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import { revalidateBlog } from "@/features/blog/application/blog-revalidate";
import { deleteBlogCoverObjects } from "@/features/blog/application/persist-blog-media";
import { deleteBlogSchema, toggleBlogSchema } from "@/features/blog/schemas";
import { requireAdmin } from "@/lib/auth/policies";
import { createId } from "@/lib/id";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

/** Activates or deactivates a post. Activation requires a cover. */
export async function toggleBlogPostAction(
  locale: string,
  raw: { postId: string; isActive: boolean },
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = toggleBlogSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid toggle payload.");
  }

  const actor = await requireAdmin(locale as Locale);

  try {
    await withTransaction((tx) => applyToggle(tx, actor.id, parsed.data));
    revalidateBlog(locale);
    return ok({ id: parsed.data.postId });
  } catch (error) {
    return toggleError(error);
  }
}

/** Deletes a post, its cover row, and the stored object. */
export async function deleteBlogPostAction(
  locale: string,
  raw: { postId: string },
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const parsed = deleteBlogSchema.safeParse(raw);
  if (!parsed.success) {
    return err("VALIDATION_ERROR", "Invalid delete payload.");
  }

  const actor = await requireAdmin(locale as Locale);

  try {
    const objectKeys = await withTransaction((tx) =>
      applyDelete(tx, actor.id, parsed.data.postId),
    );
    await deleteBlogCoverObjects(objectKeys);
    revalidateBlog(locale);
    return ok({ id: parsed.data.postId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Post not found.");
    }
    logger.error("blog.delete_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("BLOG_SAVE_FAILED", "Unable to delete the post.");
  }
}

type ToggleInput = { postId: string; isActive: boolean };
type Tx = Parameters<Parameters<typeof withTransaction>[0]>[0];

async function applyToggle(
  tx: Tx,
  actorId: string,
  input: ToggleInput,
): Promise<void> {
  const [existing] = await tx
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, input.postId))
    .for("update")
    .limit(1);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  if (input.isActive) {
    const [cover] = await tx
      .select({ id: mediaAssets.id })
      .from(mediaAssets)
      .where(eq(mediaAssets.blogPostId, existing.id))
      .limit(1);
    if (!cover) {
      throw new Error("IMAGE_REQUIRED");
    }
  }

  await tx
    .update(blogPosts)
    .set({
      isActive: input.isActive,
      publishedAt: input.isActive
        ? (existing.publishedAt ?? new Date())
        : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, existing.id));
  await tx.insert(auditLogs).values({
    id: createId(),
    actorUserId: actorId,
    action: "blog.toggle",
    targetType: "blog_post",
    targetId: existing.id,
    beforeDiff: { isActive: existing.isActive },
    afterDiff: { isActive: input.isActive },
    correlationId: createId(),
  });
}

async function applyDelete(
  tx: Tx,
  actorId: string,
  postId: string,
): Promise<string[]> {
  const [existing] = await tx
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, postId))
    .for("update")
    .limit(1);
  if (!existing) {
    throw new Error("NOT_FOUND");
  }

  const covers = await tx
    .select({ objectKey: mediaAssets.objectKey })
    .from(mediaAssets)
    .where(eq(mediaAssets.blogPostId, existing.id));
  await tx.delete(mediaAssets).where(eq(mediaAssets.blogPostId, existing.id));
  await tx.delete(blogPosts).where(eq(blogPosts.id, existing.id));
  await tx.insert(auditLogs).values({
    id: createId(),
    actorUserId: actorId,
    action: "blog.delete",
    targetType: "blog_post",
    targetId: existing.id,
    beforeDiff: { slug: existing.slug, isActive: existing.isActive },
    correlationId: createId(),
  });
  return covers.map((row) => row.objectKey);
}

function toggleError(error: unknown): Result<{ id: string }> {
  if (error instanceof Error && error.message === "NOT_FOUND") {
    return err("NOT_FOUND", "Post not found.");
  }
  if (error instanceof Error && error.message === "IMAGE_REQUIRED") {
    return err("IMAGE_REQUIRED", "Cover image is required.");
  }
  logger.error("blog.toggle_failed", {
    message: error instanceof Error ? error.message : "unknown",
  });
  return err("BLOG_SAVE_FAILED", "Unable to update the post.");
}
