import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import {
  HomeReveal,
  HomeStagger,
  HomeStaggerItem,
} from "@/features/home/ui/home-motion";
import { BRAND_ORNAMENT_SRC } from "@/lib/brand/assets";
import { STOREFRONT_PRODUCT_PHOTO } from "@/lib/media/storefront-product-photo";

type CategoryItem = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
  productCount: number;
};

type HomeCategoriesProps = {
  title: string;
  productCountLabel: string;
  emptyLabel: string;
  categories: readonly CategoryItem[];
};

function formatProductCount(template: string, count: number): string {
  return template.replace("{count}", String(count));
}

function CategoryLeafOrnaments() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-15px] right-[-20px] flex h-[81.5px] w-[88px] items-center justify-center"
      >
        <div className="-scale-y-100 rotate-[63.64deg]">
          <Image
            src={BRAND_ORNAMENT_SRC}
            alt=""
            width={56}
            height={70}
            className="h-[70px] w-[56px] object-contain"
          />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[67px] right-[-20px] flex h-[81.5px] w-[88px] items-center justify-center"
      >
        <div className="-rotate-[63.64deg]">
          <Image
            src={BRAND_ORNAMENT_SRC}
            alt=""
            width={56}
            height={70}
            className="h-[70px] w-[56px] object-contain"
          />
        </div>
      </div>
    </>
  );
}

/**
 * Home categories — Figma title 22:205 + row 22:209.
 * Full-bleed scroll row; cards keep Figma size (376×135).
 */
export function HomeCategories({
  title,
  productCountLabel,
  emptyLabel,
  categories,
}: HomeCategoriesProps) {
  return (
    <section className="relative z-[1] pt-10 pb-6 sm:pt-12 md:pt-14">
      <HomeReveal>
        <h2
          data-node-id="22:205"
          className="mb-10 text-center font-big-fat-boii text-[40px] leading-[1.05] font-normal text-white sm:mb-11 sm:text-[48px] md:mb-[42px] md:text-[58px] md:leading-[60px]"
        >
          {title}
        </h2>
      </HomeReveal>

      {categories.length === 0 ? (
        <p className="px-5 text-center text-white/70">{emptyLabel}</p>
      ) : (
        <div
          data-node-id="22:209"
          className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2"
        >
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <HomeStagger className="flex gap-[19px] px-5 py-4" stagger={0.07}>
              {categories.map((category) => (
                <HomeStaggerItem key={category.id} className="shrink-0">
                  <AppLink
                    href={category.href}
                    prefetchPolicy="intent"
                    data-node-id="22:210"
                    className="relative z-0 flex h-[135px] w-[376px] items-center overflow-hidden rounded-[20px] bg-white transition-[translate,box-shadow] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:z-10 hover:-translate-y-2 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <CategoryLeafOrnaments />

                    <div className="relative ml-1.5 h-[124px] w-[178px] shrink-0 overflow-hidden rounded-[20px]">
                      <Image
                        src={STOREFRONT_PRODUCT_PHOTO}
                        alt=""
                        fill
                        sizes="178px"
                        className="object-cover object-center"
                      />
                    </div>

                    <div className="relative z-[1] flex min-w-0 flex-1 flex-col justify-center pr-16 pl-3">
                      <span className="truncate text-[18px] leading-6 font-semibold text-[rgba(34,34,34,0.9)]">
                        {category.title}
                      </span>
                      <span className="text-[16px] leading-[30px] font-normal text-black/55">
                        {formatProductCount(
                          productCountLabel,
                          category.productCount,
                        )}
                      </span>
                    </div>
                  </AppLink>
                </HomeStaggerItem>
              ))}
            </HomeStagger>
          </div>
        </div>
      )}
    </section>
  );
}
