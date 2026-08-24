import { notFound } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/RevealMotion";
import { CatalogPageHeader } from "@/features/products/ui/CatalogPageHeader";
import { ProductCard } from "@/features/products/ui/ProductCard";
import { listWishlistProducts } from "@/features/wishlist/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import {
  createDisplayPriceFormatter,
  getSelectedCurrency,
} from "@/lib/money/display-price";

type WishlistPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const wishlistCopy = dictionary.wishlist;
  const [user, currency, products] = await Promise.all([
    getCurrentUser(),
    getSelectedCurrency(),
    listWishlistProducts(rawLocale),
  ]);

  const header = (
    <CatalogPageHeader
      heading={wishlistCopy.heading}
      headingSize="compact"
      resultsLabel={
        !user || products.length === 0
          ? wishlistCopy.resultsCountZero
          : products.length === 1
            ? wishlistCopy.resultsCountOne
            : wishlistCopy.resultsCount.replace(
                "{count}",
                String(products.length),
              )
      }
    />
  );

  if (!user) {
    return (
      <section className="flex flex-col gap-6">
        {header}
        <Reveal immediate y={16}>
          <div className="rounded-[37px] border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center">
            <p className="text-base text-white/80">
              <AppLink
                href={`/${rawLocale}/login?next=${encodeURIComponent(`/${rawLocale}/wishlist`)}`}
                prefetchPolicy="intent"
                className="font-semibold text-white underline underline-offset-2 hover:text-white/90"
              >
                {dictionary.header.login}
              </AppLink>
              <span className="text-white/60">
                {" "}
                — {wishlistCopy.signInPrompt}
              </span>
            </p>
          </div>
        </Reveal>
      </section>
    );
  }

  const formatPrice = await createDisplayPriceFormatter(rawLocale, currency);
  const priced = products.map((product) => {
    const price = formatPrice(product.priceAmount);
    const compareAt =
      product.compareAtAmount != null
        ? formatPrice(product.compareAtAmount)
        : null;

    return {
      product,
      priceFormatted: price.formatted,
      compareAtFormatted: compareAt?.formatted ?? null,
    };
  });

  return (
    <section className="flex flex-col gap-6">
      {header}

      {priced.length === 0 ? (
        <Reveal immediate y={16}>
          <div className="flex flex-col items-center gap-6 rounded-[37px] border border-dashed border-white/20 bg-white/5 px-6 py-16 text-center">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {wishlistCopy.empty}
              </h2>
              <p className="mt-2 text-sm text-white/60">
                {wishlistCopy.emptyDescription}
              </p>
            </div>
            <KamanchaPillButton
              href={`/${rawLocale}/products`}
              label={wishlistCopy.browseProducts}
              className="!max-w-[360px] !px-16 sm:!max-w-[400px]"
            />
          </div>
        </Reveal>
      ) : (
        <Stagger
          className="grid grid-cols-2 justify-items-stretch gap-3 sm:grid-cols-3 sm:justify-items-center sm:gap-5 lg:grid-cols-4"
          stagger={0.06}
          immediate
        >
          {priced.map(
            ({ product, priceFormatted, compareAtFormatted }, index) => (
              <StaggerItem
                key={product.id}
                className="min-w-0 w-full sm:max-w-[300px]"
              >
                <ProductCard
                  href={`/${rawLocale}/products/${product.translation.slug}`}
                  title={product.translation.title}
                  priceFormatted={priceFormatted}
                  compareAtFormatted={compareAtFormatted}
                  discountPercent={product.discountPercent}
                  discountOffLabel={dictionary.home.discountOff}
                  imageUrl={product.imageUrl}
                  inStock={product.stockOnHand > 0}
                  priority={index < 4}
                  locale={rawLocale}
                  productId={product.id}
                  inWishlist
                  isSignedIn
                  wishlistLabel={dictionary.nav.wishlist}
                  addToCartLabel={dictionary.product.addToCart}
                  requiresCustomization={product.hasCustomizationOptions}
                  layout="catalog"
                  className="w-full"
                />
              </StaggerItem>
            ),
          )}
        </Stagger>
      )}
    </section>
  );
}
