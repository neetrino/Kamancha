"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { SideSheet } from "@/components/ui/SideSheet";
import {
  ADMIN_INPUT,
  ADMIN_LABEL,
} from "@/features/admin/ui/admin-form-classes";
import {
  createCategoryFromDrawerAction,
  updateCategoryFromDrawerAction,
} from "@/features/categories/actions";
import { slugifyCategoryTitle } from "@/features/categories/domain/slugify";
import type { AdminCategoryListItem } from "@/features/categories/application/list-admin-categories";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";

type DrawerCopy = {
  drawer: Dictionary["admin"]["categories"]["drawer"];
  common: Dictionary["admin"]["common"];
  confirm: Dictionary["admin"]["confirm"];
};

type AddCategoryDrawerProps = {
  locale: string;
  open: boolean;
  onClose: () => void;
  categories: AdminCategoryListItem[];
  category?: AdminCategoryListItem | null;
  copy: DrawerCopy;
};

export function AddCategoryDrawer({
  locale,
  open,
  onClose,
  categories,
  category = null,
  copy,
}: AddCategoryDrawerProps) {
  const router = useRouter();
  const isEdit = category != null;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeLocale, setActiveLocale] = useState<Locale>("hy");
  const [localizedTitles, setLocalizedTitles] = useState<Record<Locale, string>>({
    hy: "",
    en: "",
    ru: "",
  });
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [parentId, setParentId] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [pendingRemoveImage, setPendingRemoveImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const activeTitle = localizedTitles[activeLocale];

  function setActiveTitle(title: string): void {
    setLocalizedTitles((current) => ({
      ...current,
      [activeLocale]: title,
    }));
  }

  function clearImage(): void {
    setImageFile(null);
    setImagePreview((current) => {
      if (current?.startsWith("blob:")) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
    if (isEdit && category?.imageUrl) {
      setRemoveExistingImage(true);
    }
    setPendingRemoveImage(false);
  }

  useEffect(() => {
    if (!open) return;

    if (category) {
      scheduleStateUpdate(setActiveLocale, "hy");
      scheduleStateUpdate(setLocalizedTitles, {
        hy: category.translations.hy?.title ?? "",
        en: category.translations.en?.title ?? "",
        ru: category.translations.ru?.title ?? "",
      });
      scheduleStateUpdate(setSlug, category.slug);
      scheduleStateUpdate(setSlugTouched, true);
      scheduleStateUpdate(setParentId, category.parentId ?? "");
      scheduleStateUpdate(
        setStatus,
        category.status === "ARCHIVED" ? "ARCHIVED" : "ACTIVE",
      );
      scheduleStateUpdate(setImageFile, null);
      scheduleStateUpdate(setImagePreview, category.imageUrl);
      scheduleStateUpdate(setRemoveExistingImage, false);
      scheduleStateUpdate(setError, null);
    } else {
      scheduleStateUpdate(setActiveLocale, "hy");
      scheduleStateUpdate(setLocalizedTitles, {
        hy: "",
        en: "",
        ru: "",
      });
      scheduleStateUpdate(setSlug, "");
      scheduleStateUpdate(setSlugTouched, false);
      scheduleStateUpdate(setParentId, "");
      scheduleStateUpdate(setStatus, "ACTIVE");
      scheduleStateUpdate(setImageFile, null);
      scheduleStateUpdate(setImagePreview, null);
      scheduleStateUpdate(setRemoveExistingImage, false);
      scheduleStateUpdate(setError, null);
    }
    scheduleStateUpdate(setPendingRemoveImage, false);
  }, [open, category]);

  const displaySlug = slugTouched
    ? slug
    : slugifyCategoryTitle(localizedTitles.hy) || "---";
  const parentOptions = categories.filter((item) => item.id !== category?.id);

  return (
    <SideSheet
      open={open}
      onClose={onClose}
      ariaLabel={isEdit ? copy.drawer.editAria : copy.drawer.addAria}
      panelClassName="w-full max-w-lg"
    >
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEdit ? copy.drawer.editTitle : copy.drawer.addTitle}
        </h2>
      </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            const missingTitleLocale = locales.find(
              (loc) => !localizedTitles[loc].trim(),
            );
            if (missingTitleLocale) {
              setError(
                `${localeLabels[missingTitleLocale]} — ${copy.drawer.categoryTitle} ${copy.common.requiredMark}`,
              );
              return;
            }
            const nextSlug =
              slugTouched && slug.trim()
                ? slug.trim()
                : slugifyCategoryTitle(localizedTitles.hy);

            const payload = {
              localizedText: {
                hy: { title: localizedTitles.hy.trim() },
                en: { title: localizedTitles.en.trim() },
                ru: { title: localizedTitles.ru.trim() },
              },
              slug: nextSlug,
              parentId,
              status,
            };

            const formData = new FormData();
            formData.set("data", JSON.stringify(payload));
            if (imageFile) {
              formData.set("image", imageFile);
            }
            if (removeExistingImage) {
              formData.set("removeImage", "1");
            }

            startTransition(async () => {
              setError(null);
              const result =
                isEdit && category
                  ? await updateCategoryFromDrawerAction(
                      locale,
                      category.id,
                      formData,
                    )
                  : await createCategoryFromDrawerAction(locale, formData);

              if (!result.ok) {
                setError(result.error.message);
                return;
              }

              onClose();
              router.refresh();
            });
          }}
        >
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {copy.drawer.translations}
              </p>
              <div className="flex flex-wrap gap-2">
                {locales.map((loc) => {
                  const selected = loc === activeLocale;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setActiveLocale(loc)}
                      className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                        selected
                          ? "bg-brand-forest text-white"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {localeLabels[loc]}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className={ADMIN_LABEL}>
                {copy.drawer.categoryTitle}{" "}
                <span className="text-red-600">{copy.common.requiredMark}</span>
              </span>
              <input
                required
                value={activeTitle}
                onChange={(event) => setActiveTitle(event.target.value)}
                placeholder={copy.drawer.categoryTitlePlaceholder}
                className={ADMIN_INPUT}
                disabled={isPending}
              />
            </label>

            <label className="block">
              <span className={ADMIN_LABEL}>{copy.drawer.slug}</span>
              <input
                value={displaySlug === "---" ? "" : displaySlug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(event.target.value);
                }}
                placeholder={copy.drawer.slugPlaceholder}
                className={ADMIN_INPUT}
                disabled={isPending}
              />
              <span className="mt-1 block text-xs text-gray-500">
                {copy.drawer.slugHint}
              </span>
            </label>

            <div>
              <span className={ADMIN_LABEL}>{copy.drawer.parentCategory}</span>
              <SelectDropdown
                ariaLabel={copy.drawer.parentCategoryAria}
                value={parentId}
                allLabel={copy.drawer.noneRootCategory}
                options={parentOptions.map((item) => ({
                  label: item.title,
                  value: item.id,
                }))}
                disabled={isPending}
                deferChange={false}
                className="mt-1"
                onValueChange={setParentId}
              />
            </div>

            <div>
              <span className={ADMIN_LABEL}>{copy.drawer.status}</span>
              <SelectDropdown
                ariaLabel={copy.drawer.statusAria}
                value={status}
                options={[
                  { label: copy.drawer.published, value: "ACTIVE" },
                  { label: copy.drawer.archived, value: "ARCHIVED" },
                ]}
                disabled={isPending}
                deferChange={false}
                className="mt-1"
                onValueChange={(next) =>
                  setStatus(next as "ACTIVE" | "ARCHIVED")
                }
              />
            </div>

            <div>
              <span className={ADMIN_LABEL}>{copy.drawer.image}</span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
                >
                  {imagePreview ? copy.drawer.changeImage : copy.drawer.uploadImage}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={isPending}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    event.target.value = "";
                    setImagePreview((current) => {
                      if (current?.startsWith("blob:")) {
                        URL.revokeObjectURL(current);
                      }
                      return file ? URL.createObjectURL(file) : null;
                    });
                    setImageFile(file);
                    setRemoveExistingImage(false);
                  }}
                />
                {imagePreview ? (
                  <button
                    type="button"
                    disabled={isPending}
                  onClick={() => setPendingRemoveImage(true)}
                  className="text-sm font-medium text-gray-600 hover:text-red-600"
                >
                  {copy.drawer.remove}
                </button>
                ) : null}
              </div>
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt=""
                  width={112}
                  height={112}
                  unoptimized
                  className="mt-3 h-28 w-28 rounded-xl border border-gray-200 object-cover"
                />
              ) : null}
            </div>

            {error ? <p className="text-sm text-red-700">{error}</p> : null}
          </div>

          <div className="flex items-center gap-4 border-t border-gray-200 px-5 py-4">
            <Button type="submit" disabled={isPending || !localizedTitles.hy.trim()}>
              {isPending
                ? isEdit
                  ? copy.common.saving
                  : copy.common.creating
                : isEdit
                  ? copy.common.save
                  : copy.drawer.createCategory}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {copy.common.cancel}
            </button>
          </div>
        </form>
      <ConfirmDialog
        open={pendingRemoveImage}
        title={copy.confirm.deleteTitle}
        description={copy.confirm.deleteImage}
        confirmLabel={copy.confirm.confirmLabel}
        cancelLabel={copy.confirm.cancelLabel}
        onClose={() => setPendingRemoveImage(false)}
        onConfirm={clearImage}
      />
    </SideSheet>
  );
}
