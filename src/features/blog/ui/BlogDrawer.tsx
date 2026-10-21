"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { SideSheet } from "@/components/ui/SideSheet";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
  ADMIN_TEXTAREA,
} from "@/features/admin/ui/admin-form-classes";
import {
  createBlogPostAction,
  updateBlogPostAction,
} from "@/features/blog/application/manage-blog";
import type { AdminBlogListItem } from "@/features/blog/application/queries";
import {
  slugifyAddressDraft,
  slugifyTitle,
} from "@/features/blog/domain/blog-copy";
import { useCoverPreview, BlogCoverField } from "@/features/blog/ui/BlogCoverField";
import { blogErrorMessage } from "@/features/blog/ui/BlogControls";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BlogLocaleDraft = { title: string; excerpt: string; body: string };

type BlogDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  post?: AdminBlogListItem | null;
  copy: Dictionary["admin"];
};

function draftsFromPost(post: AdminBlogListItem | null): Record<Locale, BlogLocaleDraft> {
  return {
    hy: draftFor(post, "hy"),
    en: draftFor(post, "en"),
    ru: draftFor(post, "ru"),
  };
}

function draftFor(post: AdminBlogListItem | null, locale: Locale): BlogLocaleDraft {
  const copy = post?.translations[locale];
  return {
    title: copy?.title ?? "",
    excerpt: copy?.excerpt ?? "",
    body: copy?.body ?? "",
  };
}

export function BlogDrawer({
  locale,
  open,
  onClose,
  post = null,
  copy,
}: BlogDrawerProps) {
  const isEdit = post != null;

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={isEdit ? copy.blog.drawer.editAria : copy.blog.drawer.createAria}
      panelClassName="w-full sm:w-1/2"
    >
      <BlogDrawerForm
        key={post?.id ?? "create"}
        locale={locale}
        onClose={onClose}
        post={post}
        copy={copy}
      />
    </SideSheet>
  );
}

type BlogDrawerFormProps = {
  locale: string;
  onClose: () => void;
  post: AdminBlogListItem | null;
  copy: Dictionary["admin"];
};

function BlogDrawerForm({ locale, onClose, post, copy }: BlogDrawerFormProps) {
  const router = useRouter();
  const isEdit = post != null;
  const [activeLocale, setActiveLocale] = useState<Locale>("hy");
  const [drafts, setDrafts] = useState(() => draftsFromPost(post));
  const [slug, setSlug] = useState(post?.slug ?? "");
  const cover = useCoverPreview(post?.imageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const active = drafts[activeLocale];
  const hasCopy = locales.some(
    (item) => drafts[item].title.trim() && drafts[item].body.trim(),
  );
  const hasImage =
    Boolean(cover.imageFile) ||
    (Boolean(cover.imagePreview) && !cover.removeExistingImage);

  function setActive(patch: Partial<BlogLocaleDraft>): void {
    setDrafts((current) => ({
      ...current,
      [activeLocale]: { ...current[activeLocale], ...patch },
    }));
  }

  return (
    <>
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? copy.blog.drawer.editTitle : copy.blog.drawer.createTitle}
        </h2>
      </div>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData();
          formData.set(
            "data",
            JSON.stringify({
              slug: slugifyTitle(slug),
              translations: drafts,
            }),
          );
          if (cover.imageFile) {
            formData.set("image", cover.imageFile);
          }
          if (cover.removeExistingImage) {
            formData.set("removeImage", "1");
          }

          startTransition(async () => {
            setError(null);
            const result =
              isEdit && post
                ? await updateBlogPostAction(locale, post.id, formData)
                : await createBlogPostAction(locale, formData);
            if (!result.ok) {
              setError(blogErrorMessage(result.error.code, copy));
              return;
            }
            onClose();
            router.refresh();
          });
        }}
      >
        <BlogDrawerFields
          copy={copy}
          activeLocale={activeLocale}
          onLocale={setActiveLocale}
          active={active}
          onActive={setActive}
          onTitle={(title) => {
            const followsTitle = !slug || slug === slugifyTitle(active.title);
            setActive({ title });
            if (followsTitle) {
              setSlug(slugifyTitle(title));
            }
          }}
          slug={slug}
          onSlug={(value) => {
            setSlug(slugifyAddressDraft(value));
          }}
          coverPreview={cover.imagePreview}
          onCover={cover.setCover}
          disabled={isPending}
          error={error}
        />
        <div className="flex items-center gap-4 border-t border-gray-200 px-5 py-4">
          <Button type="submit" disabled={isPending || !hasCopy || !hasImage}>
            {isPending
              ? isEdit
                ? copy.common.saving
                : copy.common.creating
              : isEdit
                ? copy.blog.drawer.edit
                : copy.blog.drawer.create}
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            {copy.common.cancel}
          </button>
        </div>
      </form>
    </>
  );
}

type BlogDrawerFieldsProps = {
  copy: Dictionary["admin"];
  activeLocale: Locale;
  onLocale: (locale: Locale) => void;
  active: BlogLocaleDraft;
  onActive: (patch: Partial<BlogLocaleDraft>) => void;
  onTitle: (title: string) => void;
  slug: string;
  onSlug: (value: string) => void;
  coverPreview: string | null;
  onCover: (file: File | null, removeExisting: boolean) => void;
  disabled: boolean;
  error: string | null;
};

function BlogDrawerFields({
  copy,
  activeLocale,
  onLocale,
  active,
  onActive,
  onTitle,
  slug,
  onSlug,
  coverPreview,
  onCover,
  disabled,
  error,
}: BlogDrawerFieldsProps) {
  const drawer = copy.blog.drawer;

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
      <div className="flex flex-wrap gap-2">
        {locales.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onLocale(item)}
            className={`rounded-xl px-3 py-1.5 text-sm font-medium ${
              item === activeLocale
                ? "bg-brand-forest text-white"
                : "border border-gray-300 bg-white text-gray-700"
            }`}
          >
            {localeLabels[item]}
          </button>
        ))}
      </div>
      <label className="block">
        <span className={ADMIN_LABEL}>
          {drawer.title} <span className="text-red-600">{copy.common.requiredMark}</span>
        </span>
        <input
          value={active.title}
          onChange={(event) => onTitle(event.target.value)}
          className={ADMIN_INPUT}
          disabled={disabled}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>{drawer.excerpt}</span>
        <textarea
          value={active.excerpt}
          onChange={(event) => onActive({ excerpt: event.target.value })}
          className={ADMIN_TEXTAREA}
          disabled={disabled}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>
          {drawer.body} <span className="text-red-600">{copy.common.requiredMark}</span>
        </span>
        <textarea
          value={active.body}
          onChange={(event) => onActive({ body: event.target.value })}
          className={`${ADMIN_TEXTAREA} min-h-40`}
          disabled={disabled}
        />
      </label>
      <label className="block">
        <span className={ADMIN_LABEL}>{drawer.slug}</span>
        <input
          value={slug}
          onChange={(event) => onSlug(event.target.value)}
          className={ADMIN_INPUT}
          disabled={disabled}
        />
        <span className="mt-1 block text-xs text-gray-500">
          {drawer.slugHint} /blog/{slug || "…"}
        </span>
      </label>
      <BlogCoverField
        imagePreview={coverPreview}
        disabled={disabled}
        copy={drawer}
        onFile={onCover}
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
