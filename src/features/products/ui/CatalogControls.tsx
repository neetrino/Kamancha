"use client";

import { useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Reveal } from "@/components/ui/RevealMotion";
import type { CatalogPriceBounds } from "@/features/products/application/catalog-price-bounds";
import { catalogHref } from "@/features/products/application/catalog-search-params";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import type { CatalogSort } from "@/features/products/schemas/catalog-list";
import {
  CatalogFilterForm,
  type CatalogFilterLabels,
  type CatalogSidebarCategory,
} from "@/features/products/ui/CatalogFilterForm";
import { CatalogStickySidebar } from "@/features/products/ui/CatalogStickySidebar";
import { MobileCatalogCategoryChips } from "@/features/products/ui/MobileCatalogCategoryChips";
import type { Currency } from "@/lib/money/currency";

export type CatalogLabels = CatalogFilterLabels & {
  openFilters: string;
  sortLabel: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortPopular: string;
};

type CatalogControlsProps = {
  locale: string;
  currency: Currency;
  filters: CatalogFilters;
  categories: CatalogSidebarCategory[];
  allProductsCount: number;
  priceBounds: CatalogPriceBounds;
  labels: CatalogLabels;
  children: ReactNode;
};

function sortLabelFor(sort: CatalogSort, labels: CatalogLabels): string {
  switch (sort) {
    case "price_asc":
      return labels.sortPriceAsc;
    case "price_desc":
      return labels.sortPriceDesc;
    case "popular":
      return labels.sortPopular;
    case "newest":
    default:
      return labels.sortNewest;
  }
}

const SORT_ORDER: readonly CatalogSort[] = [
  "popular",
  "newest",
  "price_asc",
  "price_desc",
];

/**
 * Catalog layout — Figma Container 103:1277 (sidebar + sort pills + grid).
 * Mobile: category chips + sort; desktop: sticky sidebar filters.
 */
export function CatalogControls({
  locale,
  currency,
  filters,
  categories,
  allProductsCount,
  priceBounds,
  labels,
  children,
}: CatalogControlsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function pushHref(href: string): void {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  }

  function navigateSort(next: CatalogSort): void {
    pushHref(
      catalogHref(locale, filters, {
        sort: next,
        page: 1,
      }),
    );
  }

  const sortPills = (
    <div
      data-node-id="103:1415"
      role="group"
      aria-label={labels.sortLabel}
      className="flex flex-wrap items-center justify-start gap-2 md:justify-end"
    >
      <span className="hidden pr-2 text-base leading-[21px] text-white/75 md:inline">
        {labels.sortLabel}
      </span>
      {SORT_ORDER.map((value) => {
        const active = filters.sort === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            onClick={() => navigateSort(value)}
            className={`rounded-[50px] px-4 py-2 text-[14px] leading-[21px] transition-colors ${
              active
                ? "bg-white font-semibold text-brand-forest"
                : "bg-white/10 font-normal text-white hover:bg-white/15"
            }`}
          >
            {sortLabelFor(value, labels)}
          </button>
        );
      })}
    </div>
  );

  return (
    <div
      data-node-id="103:1277"
      data-catalog-layout
      className="flex flex-col gap-8 xl:flex-row xl:items-start xl:gap-8"
    >
      <CatalogStickySidebar>
        <Reveal immediate x={-20} y={0} delay={0.06}>
          <CatalogFilterForm
            locale={locale}
            currency={currency}
            filters={filters}
            categories={categories}
            allProductsCount={allProductsCount}
            priceBounds={priceBounds}
            labels={labels}
          />
        </Reveal>
      </CatalogStickySidebar>

      <div className="min-w-0 flex-1">
        <Reveal immediate delay={0.08} y={12} className="mb-4 xl:hidden">
          <MobileCatalogCategoryChips
            locale={locale}
            filters={filters}
            categories={categories}
            allCategoriesLabel={labels.allCategories}
            categoriesLabel={labels.categoryLabel}
          />
        </Reveal>

        <Reveal immediate delay={0.1} y={16}>
          {sortPills}
        </Reveal>

        <div className="pt-8">{children}</div>
      </div>
    </div>
  );
}
