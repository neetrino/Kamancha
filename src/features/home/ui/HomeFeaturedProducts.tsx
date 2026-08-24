import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { HorizontalWheelScrollArea } from "@/components/ui/HorizontalWheelScrollArea";
import {
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
} from "@/features/home/ui/home-motion";
import { ProductCard } from "@/features/products/ui/ProductCard";
import type { Locale } from "@/lib/i18n/config";

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
  wishlistLabel,
  addToCartLabel,
  discountOffLabel,
  isSignedIn,
  products,
}: HomeFeaturedProductsProps) {
  return (
    <section className="relative z-[1] pt-10 pb-6 sm:pt-12 md:pt-14">
      <HomeReveal>
        <h2
          data-node-id="22:204"
          className="mb-10 text-center font-big-fat-boii text-[40px] leading-[1.05] font-normal text-white sm:mb-11 sm:text-[48px] md:mb-[42px] md:text-[58px] md:leading-[60px]"
        >
          {title}
        </h2>
      </HomeReveal>

      {products.length === 0 ? (
        <p className="px-5 text-center text-white/70">{emptyLabel}</p>
      ) : (
        <>
          <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2">
            <HorizontalWheelScrollArea>
              <HomeStagger
                className="inline-flex gap-5 px-16 py-4"
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
            </HorizontalWheelScrollArea>
          </div>

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
