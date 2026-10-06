"use client";

import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

import { SelectDropdown } from "@/components/ui/SelectDropdown";
import { useAdminFilterNavigate } from "@/features/admin/ui/admin-filter-navigation";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import { ADMIN_LABEL } from "@/features/admin/ui/admin-form-classes";
import type { AdminCategoryOption } from "@/features/products/application/list-admin-products";
import type { AdminProductsFilter } from "@/features/products/schemas/admin-list";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminProductsFiltersProps = {
  q?: string;
  categoryId?: string;
  stock: AdminProductsFilter["stock"];
  categories: AdminCategoryOption[];
  sort: string;
  dir: string;
  copy: Dictionary["admin"]["products"]["filters"];
};

export function AdminProductsFilters({
  q,
  categoryId,
  stock,
  categories,
  sort,
  dir,
  copy,
}: AdminProductsFiltersProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const navigateFilters = useAdminFilterNavigate();
  const [categoryValue, setCategoryValue] = useState(categoryId ?? "");
  const [stockValue, setStockValue] = useState(stock);

  const categoryOptions = categories.map((category) => ({
    label: category.title,
    value: category.id,
  }));

  const stopped = stockValue === "draft";

  function applyCategory(next: string): void {
    flushSync(() => setCategoryValue(next));
    navigateFilters(formRef.current, {
      categoryId: next.trim() === "" ? null : next,
    });
  }

  function applyStock(next: string): void {
    flushSync(() =>
      setStockValue(next as AdminProductsFiltersProps["stock"]),
    );
    navigateFilters(formRef.current, { stock: next });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    navigateFilters(formRef.current);
  }

  return (
    <div className="mb-4">
      <form
        ref={formRef}
        method="get"
        onSubmit={onSubmit}
        className="flex flex-col gap-4 xl:flex-row xl:items-end"
      >
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <label className="min-w-0 xl:min-w-[220px] xl:flex-1">
          <span className={ADMIN_LABEL}>{copy.searchByTitleOrSlug}</span>
          <AdminSearchInput
            name="q"
            defaultValue={q ?? ""}
            placeholder={copy.searchByTitleOrSlugPlaceholder}
            className="mt-1"
            aria-label={copy.searchByTitleOrSlugAria}
          />
        </label>
        <div className="min-w-0 xl:min-w-[200px] xl:flex-1">
          <span className={ADMIN_LABEL}>{copy.filterByCategory}</span>
          <SelectDropdown
            name="categoryId"
            ariaLabel={copy.filterByCategoryAria}
            value={categoryValue}
            allLabel={copy.allCategories}
            options={categoryOptions}
            className="mt-1"
            onValueChange={applyCategory}
          />
        </div>
        <div className="min-w-max xl:w-[360px] xl:shrink-0">
          <div>
            <span className={ADMIN_LABEL}>{copy.filterByStock}</span>
            <input type="hidden" name="stock" value={stopped ? "draft" : "all"} />
            <div
              role="group"
              aria-label={copy.filterByStockAria}
              className="relative mt-1 flex h-11 rounded-2xl border border-gray-200 bg-white p-1 shadow-sm"
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-xl bg-brand-forest transition-transform duration-300 ease-out motion-reduce:transition-none ${
                  stopped ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                aria-pressed={!stopped}
                onClick={() => applyStock("all")}
                className={`relative z-[1] min-w-0 flex-1 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition-colors duration-300 ${
                  stopped
                    ? "text-gray-600 hover:text-brand-forest"
                    : "text-white"
                }`}
              >
                {copy.allProducts}
              </button>
              <button
                type="button"
                aria-pressed={stopped}
                onClick={() => applyStock("draft")}
                className={`relative z-[1] min-w-0 flex-1 whitespace-nowrap rounded-xl px-3 text-sm font-medium transition-colors duration-300 ${
                  stopped
                    ? "text-white"
                    : "text-gray-600 hover:text-brand-forest"
                }`}
              >
                {copy.draft}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
