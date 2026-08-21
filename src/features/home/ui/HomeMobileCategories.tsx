import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { HomeReveal } from "@/features/home/ui/home-motion";
import { STOREFRONT_PRODUCT_PHOTO } from "@/lib/media/storefront-product-photo";

type CategoryItem = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
};

type HomeMobileCategoriesProps = {
  title: string;
  emptyLabel: string;
  categories: readonly CategoryItem[];
};

/**
 * Mobile home categories — Grill.am compact 88px image + label scroller.
 */
export function HomeMobileCategories({
  title,
  emptyLabel,
  categories,
}: HomeMobileCategoriesProps) {
  if (categories.length === 0) {
    return (
      <p className="px-6 pt-8 text-center text-white/70">{emptyLabel}</p>
    );
  }

  return (
    <section className="relative z-[1] pt-6 pb-2" aria-label={title}>
      <HomeReveal immediate>
        <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <li key={category.id} className="w-[88px] shrink-0 snap-start">
              <AppLink
                href={category.href}
                prefetchPolicy="intent"
                className="flex w-full flex-col items-center gap-2"
              >
                <span className="relative size-[88px] overflow-hidden rounded-full bg-white/10">
                  <Image
                    src={category.imageUrl ?? STOREFRONT_PRODUCT_PHOTO}
                    alt=""
                    fill
                    sizes="88px"
                    className="object-contain"
                  />
                </span>
                <span className="line-clamp-2 h-[33px] w-full text-center text-[11px] leading-[16.5px] font-bold break-words text-white uppercase">
                  {category.title}
                </span>
              </AppLink>
            </li>
          ))}
        </ul>
      </HomeReveal>
    </section>
  );
}
