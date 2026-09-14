"use client";

import { useEffect, useState, useTransition } from "react";

import { Reveal, Stagger, StaggerItem } from "@/components/ui/RevealMotion";
import {
  loadMoreCatalogProductsAction,
  type CatalogGridProduct,
} from "@/features/products/application/load-more-catalog-products-action";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import { ProductCard } from "@/features/products/ui/ProductCard";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";

/** Matches catalog `grid-cols-2` below this width. */
const MOBILE_TWO_COL_MQ = "(max-width: 743px)";

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
  loadMoreLabel: string;
  loadingMoreLabel: string;
  gridKey: string;
};

/**
 * Catalog grid with “see more” — keeps pageSize batches, appends below.
 * On mobile (2 columns), the visible list stays even while more remains.
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
  loadMoreLabel,
  loadingMoreLabel,
  gridKey,
}: CatalogProductGridProps) {
  const [products, setProducts] = useState<CatalogGridProduct[]>([
    ...initialProducts,
  ]);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(
    initialPage * pageSize < total && initialProducts.length > 0,
  );
  const [isPending, startTransition] = useTransition();
  const [isMobileTwoCol, setIsMobileTwoCol] = useState(false);

  useEffect(() => {
    setProducts([...initialProducts]);
    setPage(initialPage);
    setHasMore(initialPage * pageSize < total && initialProducts.length > 0);
  }, [gridKey, initialProducts, initialPage, pageSize, total]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_TWO_COL_MQ);
    function sync(): void {
      setIsMobileTwoCol(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const visibleProducts =
    isMobileTwoCol && hasMore && products.length % 2 === 1
      ? products.slice(0, -1)
      : products;

  function onLoadMore(): void {
    if (isPending || !hasMore) return;
    const nextPage = page + 1;
    startTransition(async () => {
      const result = await loadMoreCatalogProductsAction(
        locale,
        currency,
        filters,
        nextPage,
      );
      setProducts((current) => {
        const seen = new Set(current.map((item) => item.id));
        const appended = result.products.filter((item) => !seen.has(item.id));
        return [...current, ...appended];
      });
      setPage(result.page);
      setHasMore(result.hasMore);
    });
  }

  return (
    <>
      <Stagger
        key={gridKey}
        className="grid grid-cols-2 justify-items-stretch gap-3 sm:gap-5 min-[744px]:grid-cols-3"
        stagger={0.06}
        immediate
      >
        {visibleProducts.map((product, index) => (
          <StaggerItem key={product.id} className="min-w-0 w-full">
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
              className="w-full"
            />
          </StaggerItem>
        ))}
      </Stagger>

      {hasMore ? (
        <Reveal immediate delay={0.12} y={16}>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isPending}
              className="rounded-full border border-white/25 bg-white/10 px-8 py-3 font-big-fat-boii text-[15px] tracking-wide text-white transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? loadingMoreLabel : loadMoreLabel}
            </button>
          </div>
        </Reveal>
      ) : null}
    </>
  );
}
