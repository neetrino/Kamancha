"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Stagger, StaggerItem } from "@/components/ui/RevealMotion";
import {
  loadMoreCatalogProductsAction,
  type CatalogGridProduct,
} from "@/features/products/application/load-more-catalog-products-action";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import { ProductCard } from "@/features/products/ui/ProductCard";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

/** Storefront slug for the Drinks category (hy/en/ru share one slug). */
const DRINKS_CATEGORY_SLUG = "ըմպելիք";

type CatalogProductGridProps = {
  locale: Locale;
  currency: Currency;
  filters: CatalogFilters;
  initialProducts: readonly CatalogGridProduct[];
  initialPage: number;
  total: number;
  pageSize: number;
  isSignedIn: boolean;
  wishlistLabel: string;
  addToCartLabel: string;
  discountOffLabel: string;
  loadingMoreLabel: string;
};

/**
 * Catalog grid that appends the next page when the list end scrolls into view.
 * Remount via parent `key` when filters change.
 */
export function CatalogProductGrid({
  locale,
  currency,
  filters,
  initialProducts,
  initialPage,
  total,
  pageSize,
  isSignedIn,
  wishlistLabel,
  addToCartLabel,
  discountOffLabel,
  loadingMoreLabel,
}: CatalogProductGridProps) {
  const [products, setProducts] = useState<CatalogGridProduct[]>([
    ...initialProducts,
  ]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(
    initialPage * pageSize < total && initialProducts.length > 0,
  );
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isPending) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        if (loadingRef.current) return;
        loadingRef.current = true;
        const nextPage = page + 1;
        startTransition(async () => {
          try {
            const result = await loadMoreCatalogProductsAction(
              locale,
              currency,
              filters,
              nextPage,
            );
            setProducts((current) => {
              const seen = new Set(current.map((item) => item.id));
              const appended = result.products.filter(
                (item) => !seen.has(item.id),
              );
              return [...current, ...appended];
            });
            setPage(result.page);
            setHasMore(result.hasMore);
          } finally {
            loadingRef.current = false;
          }
        });
      },
      { rootMargin: "280px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [currency, filters, hasMore, isPending, locale, page]);

  const drinkPhotos = filters.category === DRINKS_CATEGORY_SLUG;

  return (
    <>
      <Stagger
        className="grid grid-cols-2 justify-items-stretch gap-3 sm:gap-5 min-[744px]:grid-cols-3"
        stagger={0.06}
        immediate
      >
        {products.map((product, index) => (
          <StaggerItem key={product.id} className="flex h-full min-w-0 w-full">
            <ProductCard
              href={product.href}
              title={product.title}
              priceFormatted={product.priceFormatted}
              compareAtFormatted={product.compareAtFormatted}
              discountPercent={product.discountPercent}
              discountOffLabel={discountOffLabel}
              rating={product.rating}
              imageUrl={product.imageUrl}
              inStock={product.inStock}
              priority={index < 2}
              locale={locale}
              productId={product.id}
              inWishlist={product.inWishlist}
              isSignedIn={isSignedIn}
              wishlistLabel={wishlistLabel}
              addToCartLabel={addToCartLabel}
              requiresCustomization={product.requiresCustomization}
              layout="catalog"
              squareImage={drinkPhotos}
              className="h-full w-full"
            />
          </StaggerItem>
        ))}
      </Stagger>

      {hasMore ? (
        <div ref={sentinelRef} className="mt-8 flex justify-center">
          {isPending ? (
            <p className="font-big-fat-boii text-[15px] tracking-wide text-white/70">
              {loadingMoreLabel}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
