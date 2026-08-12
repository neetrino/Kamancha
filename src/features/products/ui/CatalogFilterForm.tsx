"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import type { CatalogPriceBounds } from "@/features/products/application/catalog-price-bounds";
import {
  catalogHref,
  clearCatalogFiltersHref,
} from "@/features/products/application/catalog-search-params";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import { CATALOG_PRICE_FILTER_MAX } from "@/features/products/schemas/catalog-list";
import {
  CATALOG_CATEGORY_ICON_ALL,
  resolveCatalogCategoryIcon,
} from "@/features/products/ui/catalog-category-icons";
import { CatalogPriceRange } from "@/features/products/ui/CatalogPriceRange";
import type { Currency } from "@/lib/money/currency";

export type CatalogFilterLabels = {
  filters: string;
  clearFilters: string;
  categoryLabel: string;
  allCategories: string;
  priceLabel: string;
  onSaleOnly: string;
  newArrivalsOnly: string;
};

export type CatalogSidebarCategory = {
  slug: string;
  title: string;
  productCount: number;
};

type CatalogFilterFormProps = {
  locale: string;
  currency: Currency;
  filters: CatalogFilters;
  categories: CatalogSidebarCategory[];
  allProductsCount: number;
  priceBounds: CatalogPriceBounds;
  labels: CatalogFilterLabels;
  className?: string;
};

function resolveRange(
  filters: CatalogFilters,
  bounds: CatalogPriceBounds,
): { min: number; max: number } {
  const min = Math.max(0, filters.minPrice ?? bounds.min);
  const max = Math.max(
    min,
    Math.min(CATALOG_PRICE_FILTER_MAX, filters.maxPrice ?? bounds.max),
  );
  return { min, max };
}

function toFilterPrice(
  value: number,
  defaultBound: number,
  edge: "min" | "max",
): number | undefined {
  if (edge === "min") {
    if (value <= 0 || value === defaultBound) return undefined;
    return value;
  }
  if (value >= CATALOG_PRICE_FILTER_MAX || value === defaultBound) {
    return undefined;
  }
  return value;
}

function CategoryIcon({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

const CATEGORY_BTN =
  "flex w-full items-center justify-between gap-5 rounded-xl px-4 py-3 text-left transition-colors";

/**
 * Catalog sidebar — Figma Sidebar 103:1278 (categories, price, filters, clear).
 */
export function CatalogFilterForm({
  locale,
  currency,
  filters,
  categories,
  allProductsCount,
  priceBounds,
  labels,
  className = "",
}: CatalogFilterFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const initialRange = resolveRange(filters, priceBounds);
  const [rangeMin, setRangeMin] = useState(initialRange.min);
  const [rangeMax, setRangeMax] = useState(initialRange.max);
  const [onSale, setOnSale] = useState(Boolean(filters.onSale));
  const [newArrivals, setNewArrivals] = useState(Boolean(filters.newArrivals));

  const [prevFilters, setPrevFilters] = useState(filters);
  if (filters !== prevFilters) {
    const previousRange = resolveRange(prevFilters, priceBounds);
    const nextRange = resolveRange(filters, priceBounds);
    setPrevFilters(filters);
    setOnSale(Boolean(filters.onSale));
    setNewArrivals(Boolean(filters.newArrivals));
    if (rangeMin === previousRange.min && rangeMax === previousRange.max) {
      setRangeMin(nextRange.min);
      setRangeMax(nextRange.max);
    }
  }

  const isFirstDebouncePass = useRef(true);

  function pushFilters(
    next: Partial<CatalogFilters>,
    draft?: {
      rangeMin: number;
      rangeMax: number;
      onSale: boolean;
      newArrivals: boolean;
    },
  ): void {
    const current = draft ?? { rangeMin, rangeMax, onSale, newArrivals };
    const href = catalogHref(locale, filters, {
      minPrice: toFilterPrice(current.rangeMin, priceBounds.min, "min"),
      maxPrice: toFilterPrice(current.rangeMax, priceBounds.max, "max"),
      onSale: current.onSale ? true : undefined,
      newArrivals: current.newArrivals ? true : undefined,
      ...next,
      page: 1,
    });

    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  useEffect(() => {
    if (isFirstDebouncePass.current) {
      isFirstDebouncePass.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      const nextMin = toFilterPrice(rangeMin, priceBounds.min, "min");
      const nextMax = toFilterPrice(rangeMax, priceBounds.max, "max");

      if (nextMin === filters.minPrice && nextMax === filters.maxPrice) {
        return;
      }

      pushFilters({
        minPrice: nextMin,
        maxPrice: nextMax,
      });
    }, 350);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounce price only
  }, [rangeMin, rangeMax]);

  const selectedCategory = filters.category ?? "";

  return (
    <aside
      data-node-id="103:1278"
      className={`flex w-full max-w-[280px] flex-col items-start pb-8 ${className}`}
    >
      <div className="w-full">
        <h2 className="font-big-fat-boii text-[18px] leading-[27px] font-normal tracking-[0.45px] text-white uppercase">
          {labels.categoryLabel}
        </h2>

        <div
          className="flex flex-col pt-4 pb-6"
          role="listbox"
          aria-label={labels.categoryLabel}
        >
          <button
            type="button"
            role="option"
            aria-selected={!selectedCategory}
            className={`${CATEGORY_BTN} ${
              !selectedCategory
                ? "bg-white text-brand-forest"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}
            onClick={() => {
              pushFilters({ category: undefined });
            }}
          >
            <span className="flex min-w-0 items-center gap-1">
              <CategoryIcon
                src={CATALOG_CATEGORY_ICON_ALL}
                className="h-8 w-[30px]"
              />
              <span
                className={`truncate text-[15px] leading-[22.5px] ${
                  !selectedCategory ? "font-semibold" : "font-normal"
                }`}
              >
                {labels.allCategories}
              </span>
            </span>
            <span
              className={`shrink-0 text-[13px] leading-[19.5px] ${
                !selectedCategory
                  ? "font-semibold text-brand-forest/60"
                  : "text-white/50"
              }`}
            >
              ({allProductsCount})
            </span>
          </button>

          {categories.map((category) => {
            const active = selectedCategory === category.slug;
            const icon = resolveCatalogCategoryIcon(
              category.slug,
              category.title,
            );

            return (
              <div key={category.slug} className="pt-2">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`${CATEGORY_BTN} ${
                    active
                      ? "bg-white text-brand-forest"
                      : "bg-white/10 text-white hover:bg-white/15"
                  }`}
                  onClick={() => {
                    pushFilters({
                      category: active ? undefined : category.slug,
                    });
                  }}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <CategoryIcon src={icon} className="size-8" />
                    <span
                      className={`truncate text-[15px] leading-[22.5px] ${
                        active ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {category.title}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 text-[13px] leading-[19.5px] ${
                      active
                        ? "font-semibold text-brand-forest/60"
                        : "text-white/50"
                    }`}
                  >
                    ({category.productCount})
                  </span>
                </button>
              </div>
            );
          })}
          <div
            aria-hidden="true"
            className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-white/25 to-transparent"
          />
        </div>
      </div>

      <div className="w-full pt-5">
        <CatalogPriceRange
          label={labels.priceLabel}
          currency={currency}
          bounds={priceBounds}
          minValue={rangeMin}
          maxValue={rangeMax}
          onRangeChange={(min, max) => {
            setRangeMin(min);
            setRangeMax(max);
          }}
        />
      </div>

      <div className="flex w-full flex-col py-8">
        <h2 className="font-big-fat-boii text-[18px] leading-[27px] font-normal tracking-[0.45px] text-white uppercase">
          {labels.filters}
        </h2>

        <div className="flex flex-col pt-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={onSale}
              onChange={(event) => {
                const next = event.target.checked;
                setOnSale(next);
                pushFilters(
                  { onSale: next ? true : undefined },
                  {
                    rangeMin,
                    rangeMax,
                    onSale: next,
                    newArrivals,
                  },
                );
              }}
              className="size-5 shrink-0 appearance-none rounded-[5px] border-2 border-white/40 bg-transparent checked:border-white checked:bg-white checked:bg-[length:12px_12px] checked:bg-center checked:bg-no-repeat checked:[background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23265127%22%20d%3D%22M4.7%209.2%201.4%205.9l1.2-1.2%202.1%202.1%204.7-4.7%201.2%201.2z%22%2F%3E%3C%2Fsvg%3E')]"
            />
            <span className="text-[15px] leading-[22.5px] text-white">
              {labels.onSaleOnly}
            </span>
          </label>

          <label className="mt-3 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={newArrivals}
              onChange={(event) => {
                const next = event.target.checked;
                setNewArrivals(next);
                pushFilters(
                  { newArrivals: next ? true : undefined },
                  {
                    rangeMin,
                    rangeMax,
                    onSale,
                    newArrivals: next,
                  },
                );
              }}
              className="size-5 shrink-0 appearance-none rounded-[5px] border-2 border-white/40 bg-transparent checked:border-white checked:bg-white checked:bg-[length:12px_12px] checked:bg-center checked:bg-no-repeat checked:[background-image:url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23265127%22%20d%3D%22M4.7%209.2%201.4%205.9l1.2-1.2%202.1%202.1%204.7-4.7%201.2%201.2z%22%2F%3E%3C%2Fsvg%3E')]"
            />
            <span className="text-[15px] leading-[22.5px] text-white">
              {labels.newArrivalsOnly}
            </span>
          </label>
        </div>

        <KamanchaPillButton
          href={clearCatalogFiltersHref(locale)}
          label={labels.clearFilters}
          className="mt-4 max-w-[280px]"
          figmaNodeId="103:3104"
        />
      </div>
    </aside>
  );
}
