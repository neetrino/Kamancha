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
import { staticAssetBackground } from "@/lib/media/static-asset-url";

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

type TabletSheet = "white" | "forest";

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
   * sitting over the hero plate (phone).
   */
  overlayPlate?: boolean;
  /** iPad Mini / Air (744px–1023px): white sheet (featured) or forest sheet (discounted). */
  tabletSheet?: TabletSheet;
};

const FULL_BLEED_ROUNDED_SHEET =
  "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden rounded-t-[40px] pt-10 pb-6";

const TEXTURE_STYLE = {
  backgroundImage: staticAssetBackground("/assets/brand/storefront-texture.webp"),
  backgroundRepeat: "no-repeat",
  backgroundPosition: "top center",
  backgroundSize: "cover",
} as const;

function sectionClassName(
  overlayPlate: boolean,
  tabletSheet?: TabletSheet,
): string {
  if (overlayPlate) {
    return [
      FULL_BLEED_ROUNDED_SHEET,
      "z-[2] bg-brand-forest",
      tabletSheet === "white"
        ? "min-[744px]:bg-white min-[744px]:pb-16"
        : "",
    ].join(" ");
  }

  if (tabletSheet === "forest") {
    return [
      FULL_BLEED_ROUNDED_SHEET,
      "z-[3] -mt-4 min-[744px]:-mt-10 bg-brand-forest",
    ].join(" ");
  }

  return "relative z-[1] pt-8 pb-4";
}

function forestTextureClassName(
  overlayPlate: boolean,
  tabletSheet?: TabletSheet,
): string | null {
  if (overlayPlate) {
    return tabletSheet === "white"
      ? "pointer-events-none absolute inset-0 max-[743px]:block min-[744px]:hidden"
      : "pointer-events-none absolute inset-0";
  }

  if (tabletSheet === "forest") {
    return "pointer-events-none absolute inset-0";
  }

  return null;
}

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
  tabletSheet,
}: HomeMobileProductSectionProps) {
  const emptyTextClass =
    tabletSheet === "white"
      ? "px-5 pt-8 text-center text-white/70 min-[744px]:text-gray-600"
      : "px-5 pt-8 text-center text-white/70";
  const textureClassName = forestTextureClassName(overlayPlate, tabletSheet);

  return (
    <section
      data-node-id={overlayPlate ? "181:480" : undefined}
      className={sectionClassName(overlayPlate, tabletSheet)}
    >
      {textureClassName ? (
        <div
          aria-hidden
          data-node-id="196:413"
          className={textureClassName}
          style={TEXTURE_STYLE}
        />
      ) : null}

      <div className="relative z-[1]">
        <HomeSectionHeading
          title={title}
          figmaNodeId={titleNodeId}
          invertOnTablet={tabletSheet === "white"}
        />

        {products.length === 0 ? (
          <p className={emptyTextClass}>{emptyLabel}</p>
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
                        className={
                          tabletSheet === "white"
                            ? "min-[744px]:border min-[744px]:border-gray-200"
                            : undefined
                        }
                      />
                    </HomeStaggerItem>
                  ))}
                </HomeStagger>
              </div>
            </div>

            <HomeReveal
              delay={0.12}
              className={`mt-6 flex justify-center${
                tabletSheet === "white" ? " min-[744px]:mb-4" : ""
              }`}
            >
              {tabletSheet === "white" ? (
                <>
                  <div className="min-[744px]:hidden">
                    <KamanchaPillButton
                      href={viewAllHref}
                      label={viewAllLabel}
                      variant="light"
                      size="compact"
                      figmaNodeId={viewAllNodeId}
                    />
                  </div>
                  <div className="hidden min-[744px]:block">
                    <KamanchaPillButton
                      href={viewAllHref}
                      label={viewAllLabel}
                      variant="dark"
                      size="compact"
                      figmaNodeId={viewAllNodeId}
                    />
                  </div>
                </>
              ) : (
                <KamanchaPillButton
                  href={viewAllHref}
                  label={viewAllLabel}
                  variant="light"
                  size="compact"
                  figmaNodeId={viewAllNodeId}
                />
              )}
            </HomeReveal>
          </>
        )}
      </div>
    </section>
  );
}
