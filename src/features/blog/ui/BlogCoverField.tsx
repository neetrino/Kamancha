"use client";

import { useRef, useState } from "react";

import { ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type BlogCoverFieldProps = {
  imagePreview: string | null;
  disabled: boolean;
  copy: Dictionary["admin"]["blog"]["drawer"];
  onFile: (file: File | null, removeExisting: boolean) => void;
};

export function BlogCoverField({
  imagePreview,
  disabled,
  copy,
  onFile,
}: BlogCoverFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <span className={ADMIN_LABEL}>{copy.cover}</span>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center rounded-xl border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50"
        >
          {imagePreview ? copy.changeImage : copy.uploadImage}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            event.target.value = "";
            onFile(file, false);
          }}
        />
        {imagePreview ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onFile(null, true)}
            className="text-sm font-medium text-gray-600 hover:text-red-600"
          >
            {copy.remove}
          </button>
        ) : null}
      </div>
      {imagePreview ? (
        // eslint-disable-next-line @next/next/no-img-element -- local blob/admin preview
        <img
          src={imagePreview}
          alt=""
          className="mt-3 max-h-64 w-full rounded-xl border border-gray-200 object-contain"
        />
      ) : null}
    </div>
  );
}

/** Revokes a blob URL created for a local cover preview. */
export function revokePreview(url: string | null): void {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function useCoverPreview(initial: string | null) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initial);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  function setCover(file: File | null, removeExisting: boolean): void {
    setImagePreview((current) => {
      revokePreview(current);
      if (file) {
        return URL.createObjectURL(file);
      }
      return removeExisting ? null : current;
    });
    setImageFile(file);
    setRemoveExistingImage(removeExisting && !file);
  }

  return { imageFile, imagePreview, removeExistingImage, setCover };
}
