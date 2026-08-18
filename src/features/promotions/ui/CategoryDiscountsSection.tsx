"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  ADMIN_INPUT,
  ADMIN_SECTION_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import type { DiscountBoardCategory } from "@/features/promotions/application/discounts-board";
import { saveCategoryDiscountsAction } from "@/features/promotions/application/manage-discounts";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const PAGE_SIZE = 5;

type CategoryDiscountsSectionCopy = {
  categories: Dictionary["admin"]["discounts"]["categories"];
  common: Dictionary["admin"]["common"];
};

type CategoryDiscountsSectionProps = {
  locale: string;
  categories: DiscountBoardCategory[];
  copy: CategoryDiscountsSectionCopy;
};

function parsePercent(raw: string): number | null | "invalid" {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const next = Number(trimmed);
  if (!Number.isInteger(next) || next < 1 || next > 100) return "invalid";
  return next;
}

export function CategoryDiscountsSection({
  locale,
  categories,
  copy,
}: CategoryDiscountsSectionProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      categories.map((category) => [
        category.id,
        category.discountPercent != null
          ? String(category.discountPercent)
          : "",
      ]),
    ),
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDrafts(
      Object.fromEntries(
        categories.map((category) => [
          category.id,
          category.discountPercent != null
            ? String(category.discountPercent)
            : "",
        ]),
      ),
    );
  }, [categories]);

  const isDirty = useMemo(() => {
    return categories.some((category) => {
      const draft = drafts[category.id] ?? "";
      const saved =
        category.discountPercent != null
          ? String(category.discountPercent)
          : "";
      return draft !== saved;
    });
  }, [categories, drafts]);

  const totalPages = Math.max(1, Math.ceil(categories.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = categories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function saveAll(): void {
    const items: Array<{ categoryId: string; percentage: number | null }> = [];
    for (const category of categories) {
      const parsed = parsePercent(drafts[category.id] ?? "");
      if (parsed === "invalid") {
        setError(
          copy.categories.invalidPercent.replace("{title}", category.title),
        );
        return;
      }
      items.push({ categoryId: category.id, percentage: parsed });
    }

    startTransition(async () => {
      setError(null);
      setMessage(null);
      const result = await saveCategoryDiscountsAction(locale, { items });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setMessage(
        copy.categories.savedCount.replace("{count}", String(result.value.saved)),
      );
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={ADMIN_SECTION_TITLE}>
            {copy.categories.title}
          </h2>
          <p className="text-sm text-gray-500">{copy.categories.subtitle}</p>
        </div>
        <Button
          type="button"
          size="field"
          disabled={isPending || !isDirty || categories.length === 0}
          onClick={saveAll}
        >
          {isPending ? copy.common.saving : copy.common.save}
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-500">
          {copy.categories.empty}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
          {pageItems.map((category) => (
            <li
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {category.title}
                </p>
                <p className="text-xs text-gray-500">{category.parentLabel}</p>
              </div>
              <div className="flex items-center gap-2">
                <label
                  className="sr-only"
                  htmlFor={`cat-discount-${category.id}`}
                >
                  {copy.categories.discountForAria.replace(
                    "{title}",
                    category.title,
                  )}
                </label>
                <input
                  id={`cat-discount-${category.id}`}
                  type="number"
                  min={0}
                  max={100}
                  inputMode="numeric"
                  disabled={isPending}
                  value={drafts[category.id] ?? ""}
                  onChange={(event) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [category.id]: event.target.value,
                    }))
                  }
                  className={`${ADMIN_INPUT} w-20`}
                />
                <span className="text-sm text-gray-500">%</span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    setDrafts((prev) => ({ ...prev, [category.id]: "" }))
                  }
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                >
                  {copy.common.clear}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {categories.length > 0 && totalPages > 1 ? (
        <nav
          className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-700"
          aria-label={copy.categories.title}
        >
          <button
            type="button"
            disabled={currentPage <= 1}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={copy.common.previous}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <span>
            {copy.common.pageOf
              .replace("{page}", String(currentPage))
              .replace("{totalPages}", String(totalPages))}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={copy.common.next}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </nav>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {message ? <p className="mt-3 text-sm text-green-700">{message}</p> : null}
    </section>
  );
}
