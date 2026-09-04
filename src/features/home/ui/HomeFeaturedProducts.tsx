import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import {
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
} from "@/features/home/ui/home-motion";
import { HomeScrollRail } from "@/features/home/ui/HomeScrollRail";
import { ProductCard } from "@/features/products/ui/ProductCard";
import type { Locale } from "@/lib/i18n/config";

const RAIL_INSET = "px-16";
const TITLE_CLASS =
  "font-big-fat-boii text-[40px] leading-[1.05] font-normal text-white sm:text-[48px] md:text-[58px] md:leading-[60px]";

type FeaturedItem = {
  id: string;
  href: string;
  title: string;
  priceFormatted: string;
  compareAtFormatted?: string | null;
  discountPercent?: number | null;
  categoryLabel?: string | null;
  rating?: number | null;
  imageUrl: string | null;
  inStock: boolean;
  inWishlist?: boolean;
  requiresCustomization?: boolean;
};

type HomeFeaturedProductsProps = {
  locale: Locale;
  title: string;
  viewAllLabel: string;
  viewAllHref: string;
  emptyLabel: string;
  previousLabel: string;
  nextLabel: string;
  wishlistLabel: string;
  addToCartLabel: string;
  discountOffLabel: string;
  isSignedIn: boolean;
  products: readonly FeaturedItem[];
};

/**
 * Home featured strip — Figma title 22:204, cards 22:230, CTA 22:200.
 */
export function HomeFeaturedProducts({
  locale,
  title,
  viewAllLabel,
  viewAllHref,
  emptyLabel,
  previousLabel,
  nextLabel,
  wishlistLabel,
  addToCartLabel,
  discountOffLabel,
  isSignedIn,
  products,
}: HomeFeaturedProductsProps) {
  return (
    <section className="relative z-[1] pt-10 pb-6 sm:pt-12 md:pt-14">
      {products.length === 0 ? (
        <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
          <HomeReveal>
            <h2
              data-node-id="22:204"
              className={`mb-10 text-left ${RAIL_INSET} ${TITLE_CLASS} sm:mb-11 md:mb-[42px]`}
            >
              {title}
            </h2>
          </HomeReveal>
          <p className={`text-left text-white/70 ${RAIL_INSET}`}>{emptyLabel}</p>
        </div>
      ) : (
        <>
          <HomeScrollRail
            title={title}
            titleNodeId="22:204"
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            insetClassName={RAIL_INSET}
            titleClassName={TITLE_CLASS}
          >
            <HomeStagger
              className={`inline-flex gap-5 pb-4 pt-5 ${RAIL_INSET}`}
              stagger={0.08}
            >
              {products.map((product, index) => (
                <HomeStaggerItem key={product.id} className="shrink-0" y={0}>
                  <ProductCard
                    href={product.href}
                    title={product.title}
                    priceFormatted={product.priceFormatted}
                    compareAtFormatted={product.compareAtFormatted}
                    discountPercent={product.discountPercent}
                    categoryLabel={product.categoryLabel}
                    rating={product.rating}
                    discountOffLabel={discountOffLabel}
                    imageUrl={product.imageUrl}
                    inStock={product.inStock}
                    priority={index < 4}
                    locale={locale}
                    productId={product.id}
                    inWishlist={product.inWishlist ?? false}
                    isSignedIn={isSignedIn}
                    wishlistLabel={wishlistLabel}
                    addToCartLabel={addToCartLabel}
                    requiresCustomization={
                      product.requiresCustomization ?? false
                    }
                  />
                </HomeStaggerItem>
              ))}
            </HomeStagger>
          </HomeScrollRail>

          <HomeReveal
            delay={0.15}
            className="mt-8 flex justify-center sm:mt-10"
          >
            <KamanchaPillButton
              href={viewAllHref}
              label={viewAllLabel}
              variant="light"
              figmaNodeId="22:200"
              className="max-w-[316px]"
            />
          </HomeReveal>
        </>
      )}
    </section>
  );
}
