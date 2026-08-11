import { notFound } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
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
      locale={rawLocale}
      breadcrumbLabel={wishlistCopy.breadcrumbLabel}
      homeLabel={dictionary.nav.home}
      productsLabel={wishlistCopy.title}
      heading={wishlistCopy.heading}
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
            className="max-w-[280px]"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {priced.map(
            ({ product, priceFormatted, compareAtFormatted }, index) => (
              <ProductCard
                key={product.id}
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
                layout="fluid"
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}
