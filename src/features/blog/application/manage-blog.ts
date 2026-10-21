"use server";

import { eq } from "drizzle-orm";

import { auditLogs, blogPosts } from "@/db/schema";
import { withTransaction } from "@/db/transaction";
import { allocateBlogSlug } from "@/features/blog/application/blog-slug";
import { revalidateBlog } from "@/features/blog/application/blog-revalidate";
import {
  compactBlogTranslations,
  firstBlogTitle,
  parseBlogFormData,
} from "@/features/blog/application/blog-payload";
import { persistBlogCover } from "@/features/blog/application/persist-blog-media";
import { requireAdmin } from "@/lib/auth/policies";
import { createId } from "@/lib/id";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { logger } from "@/lib/observability/logger";
import { err, ok, type Result } from "@/lib/result";

function imageFile(formData: FormData): File | null {
  const image = formData.get("image");
  return image instanceof File && image.size > 0 ? image : null;
}

/** Creates a draft post and stores its cover. */
export async function createBlogPostAction(
  locale: string,
  formData: FormData,
): Promise<Result<{ id: string }>> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const data = parseBlogFormData(formData);
  const image = imageFile(formData);
  if (!data) {
    return err("VALIDATION_ERROR", "Invalid blog payload.");
  }
  if (!image) {
    return err("IMAGE_REQUIRED", "Cover image is required.");
  }

  const actor = await requireAdmin(locale as Locale);
  const id = createId();
  const translations = compactBlogTranslations(data.translations);

  try {
    const slug = await withTransaction(async (tx) => {
      const nextSlug = await allocateBlogSlug(
        tx,
        data.slug,
        firstBlogTitle(data.translations),
      );
      await tx.insert(blogPosts).values({
        id,
        authorUserId: actor.id,
        slug: nextSlug,
        translations,
        isActive: false,
      });
      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "blog.create",
        targetType: "blog_post",
        targetId: id,
        afterDiff: { slug: nextSlug, isActive: false },
        correlationId: createId(),
      });
      return nextSlug;
    });

    const media = await persistBlogCover(id, image);
    if (media.error) {
      await withTransaction(async (tx) => {
        await tx.delete(blogPosts).where(eq(blogPosts.id, id));
      });
      return err("VALIDATION_ERROR", media.error);
    }

    revalidateBlog(locale);
    return ok({ id, slug });
  } catch (error) {
    logger.error("blog.create_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("BLOG_SAVE_FAILED", "Unable to create the post.");
  }
}

type UpdateResult = Result<{ id: string }>;

/** Updates copy, slug, and an optional replacement cover. */
export async function updateBlogPostAction(
  locale: string,
  postId: string,
  formData: FormData,
): Promise<UpdateResult> {
  if (!isLocale(locale)) {
    return err("INVALID_LOCALE", "Invalid locale.");
  }

  const data = parseBlogFormData(formData);
  if (!data) {
    return err("VALIDATION_ERROR", "Invalid blog payload.");
  }

  const actor = await requireAdmin(locale as Locale);
  const translations = compactBlogTranslations(data.translations);
  const image = imageFile(formData);
  const removeImage = formData.get("removeImage") === "1";
  if (removeImage && !image) {
    return err("IMAGE_REQUIRED", "Cover image is required.");
  }

  try {
    await withTransaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, postId))
        .for("update")
        .limit(1);
      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      const slug = await allocateBlogSlug(
        tx,
        data.slug,
        firstBlogTitle(data.translations),
        postId,
      );
      await tx
        .update(blogPosts)
        .set({ slug, translations, updatedAt: new Date() })
        .where(eq(blogPosts.id, postId));
      await tx.insert(auditLogs).values({
        id: createId(),
        actorUserId: actor.id,
        action: "blog.update",
        targetType: "blog_post",
        targetId: postId,
        beforeDiff: { slug: existing.slug },
        afterDiff: { slug },
        correlationId: createId(),
      });
    });

    if (image) {
      const media = await persistBlogCover(postId, image);
      if (media.error) {
        return err("VALIDATION_ERROR", media.error);
      }
    }

    revalidateBlog(locale);
    return ok({ id: postId });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return err("NOT_FOUND", "Post not found.");
    }
    logger.error("blog.update_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return err("BLOG_SAVE_FAILED", "Unable to update the post.");
  }
}
