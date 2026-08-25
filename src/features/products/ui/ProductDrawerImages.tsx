"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { X } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { createClientId } from "@/lib/id";

export type ProductDraftImage = {
  key: string;
  previewUrl: string;
  isPrimary: boolean;
  /** Existing DB media id when editing. */
  existingId?: string;
  file?: File;
};

type ProductDrawerImagesProps = {
  images: ProductDraftImage[];
  disabled: boolean;
  onChange: (images: ProductDraftImage[]) => void;
  copy: Dictionary["admin"]["products"]["images"];
  confirm: Dictionary["admin"]["confirm"];
};

export function ProductDrawerImages({
  images,
  disabled,
  onChange,
  copy,
  confirm,
}: ProductDrawerImagesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  function setPrimary(key: string): void {
    onChange(
      images.map((image) => ({
        ...image,
        isPrimary: image.key === key,
      })),
    );
  }

  function removeImage(key: string): void {
    const next = images.filter((image) => image.key !== key);
    const first = next[0];
    if (first && !next.some((image) => image.isPrimary)) {
      next[0] = { ...first, isPrimary: true };
    }
    const removed = images.find((image) => image.key === key);
    if (removed?.file) {
      URL.revokeObjectURL(removed.previewUrl);
    }
    onChange(next);
  }

  function handleFiles(fileList: FileList | null): void {
    if (!fileList || fileList.length === 0) return;
    const additions: ProductDraftImage[] = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      additions.push({
        key: `new-${createClientId()}`,
        previewUrl: URL.createObjectURL(file),
        isPrimary: false,
        file,
      });
    }
    if (additions.length === 0) return;
    const merged = [...images, ...additions];
    const first = merged[0];
    if (first && !merged.some((image) => image.isPrimary)) {
      merged[0] = { ...first, isPrimary: true };
    }
    onChange(merged);
  }

  return (
    <div>
      <span className={ADMIN_LABEL}>{copy.mainProductImage}</span>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
        >
          {copy.uploadImage}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">{copy.hint}</p>

      {images.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <li
              key={image.key}
              className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
            >
              <Image
                src={image.previewUrl}
                alt=""
                width={200}
                height={200}
                unoptimized
                className="aspect-square w-full object-cover"
              />
              <div className="flex items-center justify-between gap-2 px-2 py-2">
                <label className="flex items-center gap-1.5 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={image.isPrimary}
                    disabled={disabled}
                    onChange={() => setPrimary(image.key)}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                  />
                  {copy.main}
                </label>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setPendingKey(image.key)}
                  className="rounded p-1 text-gray-500 hover:bg-white hover:text-red-600"
                  aria-label={copy.removeAria}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <ConfirmDialog
        open={pendingKey !== null}
        title={confirm.deleteTitle}
        description={confirm.deleteImage}
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        onClose={() => setPendingKey(null)}
        onConfirm={() => {
          if (!pendingKey) return;
          removeImage(pendingKey);
          setPendingKey(null);
        }}
      />
    </div>
  );
}
