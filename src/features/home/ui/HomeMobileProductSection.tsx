import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import {
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
  HOME_HORIZONTAL_SCROLL,
} from "@/features/home/ui/home-motion";
import { HomeSectionHeading } from "@/features/home/ui/HomeSectionHeading";
import { ProductCard } from "@/features/products/ui/ProductCard";
import type { Locale } from "@/lib/i18n/config";

type MobileProductItem = {
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

type HomeMobileProductSectionProps = {
  locale: Locale;
  title: string;
  titleNodeId?: string;
  viewAllLabel: string;
  viewAllHref: string;
  viewAllNodeId?: string;
  emptyLabel: string;
  wishlistLabel: string;
  addToCartLabel: string;
  discountOffLabel: string;
  isSignedIn: boolean;
  products: readonly MobileProductItem[];
  /**
   * Figma Featured 181:480 / 196:413 — forest sheet with rounded top
   * sitting over the hero plate.
   */
  overlayPlate?: boolean;
};

/**
 * Mobile home product block — Figma Featured 181:480 / Sale 196:362.
 */
export function HomeMobileProductSection({
  locale,
  title,
  titleNodeId,
  viewAllLabel,
  viewAllHref,
  viewAllNodeId,
  emptyLabel,
  wishlistLabel,
  addToCartLabel,
  discountOffLabel,
  isSignedIn,
  products,
  overlayPlate = false,
}: HomeMobileProductSectionProps) {
  return (
    <section
      data-node-id={overlayPlate ? "181:480" : undefined}
      className={
        overlayPlate
          ? "relative z-[2] left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden rounded-t-[40px] bg-brand-forest pt-10 pb-6"
          : "relative z-[1] pt-8 pb-4"
      }
    >
      {overlayPlate ? (
        <div
          aria-hidden
          data-node-id="196:413"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "url(/assets/brand/storefront-texture.webp)",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top center",
            backgroundSize: "cover",
          }}
        />
      ) : null}

      <div className="relative z-[1]">
        <HomeSectionHeading title={title} figmaNodeId={titleNodeId} />

      {products.length === 0 ? (
        <p className="px-5 pt-8 text-center text-white/70">{emptyLabel}</p>
      ) : (
        <>
          <div className="relative left-1/2 mt-4 w-screen max-w-[100vw] -translate-x-1/2">
            <div className={HOME_HORIZONTAL_SCROLL}>
              <HomeStagger
                className="inline-flex gap-[13px] px-2.5 py-3"
                stagger={0.08}
              >
                {products.map((product, index) => (
                  <HomeStaggerItem
                    key={product.id}
                    className="w-[214px] shrink-0"
                    y={0}
                  >
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
                      priority={index < 2}
                      locale={locale}
                      productId={product.id}
                      inWishlist={product.inWishlist ?? false}
                      isSignedIn={isSignedIn}
                      wishlistLabel={wishlistLabel}
                      addToCartLabel={addToCartLabel}
                      requiresCustomization={
                        product.requiresCustomization ?? false
                      }
                      layout="compact"
                    />
                  </HomeStaggerItem>
                ))}
              </HomeStagger>
            </div>
          </div>

          <HomeReveal delay={0.12} className="mt-6 flex justify-center">
            <KamanchaPillButton
              href={viewAllHref}
              label={viewAllLabel}
              variant="light"
              size="compact"
              figmaNodeId={viewAllNodeId}
            />
          </HomeReveal>
        </>
      )}
      </div>
    </section>
  );
}
