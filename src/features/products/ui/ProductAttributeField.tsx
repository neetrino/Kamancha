"use client";

import { Trash2, X } from "lucide-react";
import { useState } from "react";

import { ADMIN_INPUT, ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import {
  createAttributeAction,
  deleteAttributeAction,
} from "@/features/attributes/actions";
import type { AttributeOption } from "@/features/attributes/types";
import { localeLabels, locales, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ProductAttributeFieldProps = {
  locale: string;
  library: AttributeOption[];
  selectedIds: string[];
  disabled: boolean;
  onLibraryChange: (library: AttributeOption[]) => void;
  onSelectedChange: (ids: string[]) => void;
  copy: Dictionary["admin"]["products"]["attributes"];
};

export function ProductAttributeField({
  locale,
  library,
  selectedIds,
  disabled,
  onLibraryChange,
  onSelectedChange,
  copy,
}: ProductAttributeFieldProps) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [titles, setTitles] = useState<Record<Locale, string>>({
    hy: "",
    en: "",
    ru: "",
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedTitles = library
    .filter((option) => selectedIds.includes(option.id))
    .map((option) => option.title);

  function toggle(id: string): void {
    onSelectedChange(
      selectedIds.includes(id)
        ? selectedIds.filter((row) => row !== id)
        : [...selectedIds, id],
    );
  }

  function setTitle(localeKey: Locale, value: string): void {
    setTitles((current) => ({ ...current, [localeKey]: value }));
  }

  async function addAttribute(): Promise<void> {
    if (!titles.hy.trim() || !titles.en.trim() || !titles.ru.trim()) {
      setError(copy.required);
      return;
    }
    setPending(true);
    setError(null);
    const result = await createAttributeAction(locale, titles);
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    onLibraryChange([...library, result.value]);
    onSelectedChange([...selectedIds, result.value.id]);
    setTitles({ hy: "", en: "", ru: "" });
    setAdding(false);
  }

  function closeDialog(): void {
    setOpen(false);
    setAdding(false);
    setError(null);
  }

  async function removeAttribute(id: string): Promise<void> {
    setPending(true);
    setError(null);
    const result = await deleteAttributeAction(locale, id);
    setPending(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    onLibraryChange(library.filter((option) => option.id !== id));
    onSelectedChange(selectedIds.filter((row) => row !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      <span className={ADMIN_LABEL}>{copy.label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center rounded-2xl border border-gray-200 bg-white px-4 py-2 text-left text-sm text-gray-900 shadow-sm hover:border-gray-300 disabled:opacity-50"
      >
        {selectedTitles.length > 0 ? selectedTitles.join(", ") : copy.open}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label={copy.close}
            className="absolute inset-0 bg-black/40"
            onClick={closeDialog}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={copy.label}
            className="relative z-10 flex max-h-[min(48rem,90vh)] w-full max-w-2xl flex-col rounded-3xl bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900">{copy.label}</h3>
              <button
                type="button"
                aria-label={copy.close}
                onClick={closeDialog}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="border-b border-gray-200 px-5 py-4">
              {adding ? (
                <div className="flex flex-col gap-3">
                  {locales.map((localeKey) => (
                    <label key={localeKey}>
                      <span className={ADMIN_LABEL}>{localeLabels[localeKey]}</span>
                      <input
                        value={titles[localeKey]}
                        onChange={(event) => setTitle(localeKey, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          void addAttribute();
                        }}
                        className={ADMIN_INPUT}
                        disabled={pending || disabled}
                        maxLength={80}
                      />
                    </label>
                  ))}
                  <button
                    type="button"
                    disabled={pending || disabled}
                    onClick={() => void addAttribute()}
                    className="h-11 rounded-2xl bg-brand-forest px-4 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {copy.add}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => setAdding(true)}
                  className="h-11 w-full rounded-2xl bg-brand-forest px-4 text-sm font-medium text-white disabled:opacity-50"
                >
                  {copy.addNew}
                </button>
              )}
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
              {library.length === 0 ? (
                <li className="px-2 py-6 text-center text-sm text-gray-500">{copy.empty}</li>
              ) : (
                library.map((option) => {
                  const selected = selectedIds.includes(option.id);
                  return (
                    <li key={option.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={pending || disabled}
                        aria-pressed={selected}
                        onClick={() => toggle(option.id)}
                        className={`min-w-0 flex-1 rounded-xl px-3 py-2 text-left text-sm ${
                          selected
                            ? "bg-brand-forest/10 font-medium text-brand-forest"
                            : "text-gray-800 hover:bg-gray-50"
                        }`}
                      >
                        {option.title}
                      </button>
                      <button
                        type="button"
                        aria-label={copy.delete}
                        disabled={pending || disabled}
                        onClick={() => void removeAttribute(option.id)}
                        className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
            {error ? <p className="px-5 pb-4 text-sm text-red-700">{error}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
