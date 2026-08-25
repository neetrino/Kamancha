"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { Image as ImageIcon, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { uploadCashChangeImageAction } from "@/features/delivery/application/upload-cash-change-image";
import type { CashChangeDenomination } from "@/features/delivery/domain/cash-change";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { createClientId } from "@/lib/id";
import { formatMoneyAmount } from "@/lib/money/format";

type CashChangeCopy = Dictionary["admin"]["delivery"]["cashChange"];
type ConfirmCopy = Dictionary["admin"]["confirm"];

type AdminCashChangeEditorProps = {
  locale: string;
  value: CashChangeDenomination[];
  imageUrls: Record<string, string>;
  onChange: (next: CashChangeDenomination[]) => void;
  onImageUrlsChange: (next: Record<string, string>) => void;
  disabled?: boolean;
  copy: CashChangeCopy;
  confirm: ConfirmCopy;
  saveAction?: ReactNode;
};

export function AdminCashChangeEditor({
  locale,
  value,
  imageUrls,
  onChange,
  onImageUrlsChange,
  disabled = false,
  copy,
  confirm,
  saveAction,
}: AdminCashChangeEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  function updateItem(
    id: string,
    patch: Partial<CashChangeDenomination>,
  ): void {
    onChange(
      value.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function addItem(): void {
    onChange([
      ...value,
      {
        id: createClientId(),
        amount: 0,
        imageObjectKey: null,
        isActive: true,
        sortOrder: value.length,
      },
    ]);
  }

  function removeItem(id: string): void {
    onChange(value.filter((item) => item.id !== id));
    const nextUrls = { ...imageUrls };
    delete nextUrls[id];
    onImageUrlsChange(nextUrls);
  }

  function pickImage(id: string): void {
    setUploadTargetId(id);
    setError(null);
    fileInputRef.current?.click();
  }

  function onFileSelected(fileList: FileList | null): void {
    const file = fileList?.[0];
    const targetId = uploadTargetId;
    if (!file || !targetId) return;

    startUpload(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadCashChangeImageAction(locale, formData);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }

      updateItem(targetId, { imageObjectKey: result.value.objectKey });
      onImageUrlsChange({
        ...imageUrls,
        [targetId]: result.value.url,
      });
      setUploadTargetId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold text-gray-900">{copy.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{copy.hint}</p>
      </div>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => onFileSelected(event.target.files)}
      />

      <ul className="grid grid-cols-1 gap-2 md:grid-cols-3">
        {value.map((item) => {
          const previewUrl = imageUrls[item.id] ?? null;
          const imageActionLabel =
            isUploading && uploadTargetId === item.id
              ? copy.uploading
              : previewUrl
                ? copy.changeImage
                : copy.uploadImage;
          return (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-2.5 py-3"
            >
              <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gray-50">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote/local object URL
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="px-1 text-center text-[10px] leading-tight text-gray-400">
                    {copy.noImage}
                  </span>
                )}
              </div>

              <label className="min-w-0 flex-1">
                <span className="sr-only">{copy.amount}</span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={item.amount > 0 ? String(item.amount) : ""}
                  onChange={(event) =>
                    updateItem(item.id, {
                      amount: Number(event.target.value) || 0,
                    })
                  }
                  placeholder={copy.amountPlaceholder}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-2.5 text-sm text-gray-900 outline-none transition-colors hover:border-gray-300 focus:border-gray-300"
                  disabled={disabled || isUploading}
                  title={
                    item.amount > 0
                      ? formatMoneyAmount(item.amount, "AMD", locale)
                      : undefined
                  }
                />
              </label>

              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.isActive}
                  disabled={disabled || isUploading}
                  onClick={() =>
                    updateItem(item.id, { isActive: !item.isActive })
                  }
                  className={`relative h-5 w-9 rounded-full transition-colors disabled:opacity-50 ${
                    item.isActive ? "bg-green-500" : "bg-gray-300"
                  }`}
                  aria-label={copy.active}
                  title={copy.active}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      item.isActive ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
                <button
                  type="button"
                  disabled={disabled || isUploading}
                  onClick={() => pickImage(item.id)}
                  className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
                  aria-label={imageActionLabel}
                  title={imageActionLabel}
                >
                  {isUploading && uploadTargetId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : previewUrl ? (
                    <ImageIcon className="h-4 w-4" aria-hidden />
                  ) : (
                    <ImagePlus className="h-4 w-4" aria-hidden />
                  )}
                </button>
                <button
                  type="button"
                  disabled={disabled || isUploading}
                  onClick={() =>
                    setPendingDelete({
                      id: item.id,
                      name:
                        item.amount > 0
                          ? formatMoneyAmount(item.amount, "AMD", locale)
                          : copy.amount,
                    })
                  }
                  className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  aria-label={copy.remove}
                  title={copy.remove}
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={disabled || isUploading || value.length >= 20}
          onClick={addItem}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {copy.add}
        </Button>
        {saveAction}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={confirm.deleteTitle}
        description={
          pendingDelete
            ? confirm.deleteEntity
                .replace("{entity}", confirm.entityLabels.denomination)
                .replace("{name}", pendingDelete.name)
            : ""
        }
        confirmLabel={confirm.confirmLabel}
        cancelLabel={confirm.cancelLabel}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          removeItem(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
