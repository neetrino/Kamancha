import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import type { HeaderSearchProduct } from "@/features/products/application/search-header-products-action";
import { storefrontProductImageSrc } from "@/lib/media/storefront-product-photo";

type HeaderSearchSuggestionsProps = {
  products: HeaderSearchProduct[];
  pending: boolean;
  showIdle: boolean;
  showEmpty: boolean;
  idleLabel: string;
  emptyLabel: string;
  viewAllHref: string | null;
  viewAllLabel: string;
  onViewAll?: () => void;
  className?: string;
};

/** Product suggestion list shared by header and mobile catalog search. */
export function HeaderSearchSuggestions({
  products,
  pending,
  showIdle,
  showEmpty,
  idleLabel,
  emptyLabel,
  viewAllHref,
  viewAllLabel,
  onViewAll,
  className = "",
}: HeaderSearchSuggestionsProps) {
  return (
    <div
      className={`flex max-h-[min(50vh,320px)] flex-col overflow-hidden rounded-2xl bg-white text-left shadow-xl ${className}`}
      role="listbox"
    >
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {showIdle ? (
          <p className="px-5 py-6 text-center text-sm text-gray-500">
            {idleLabel}
          </p>
        ) : null}
        {showEmpty ? (
          <p className="px-5 py-6 text-center text-sm text-gray-500">
            {emptyLabel}
          </p>
        ) : null}
        {products.length > 0 ? (
          <ul className={`divide-y divide-gray-100 ${pending ? "opacity-70" : ""}`}>
            {products.map((product) => (
              <li key={product.id}>
                <AppLink
                  href={product.href}
                  prefetchPolicy="intent"
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={storefrontProductImageSrc(product.imageUrl)}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.title}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {product.compareAtFormatted ? (
                        <>
                          <span className="mr-2 text-gray-400 line-through">
                            {product.compareAtFormatted}
                          </span>
                          <span>{product.priceFormatted}</span>
                        </>
                      ) : (
                        product.priceFormatted
                      )}
                    </p>
                  </div>
                </AppLink>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {viewAllHref ? (
        <div className="border-t border-gray-200 px-4 py-3">
          <AppLink
            href={viewAllHref}
            prefetchPolicy="intent"
            onClick={onViewAll}
            className="block text-center text-sm font-medium text-gray-900"
          >
            {viewAllLabel}
          </AppLink>
        </div>
      ) : null}
    </div>
  );
}
