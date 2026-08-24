import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { BRAND_ORNAMENT_SRC } from "@/lib/brand/assets";
import { STOREFRONT_PRODUCT_PHOTO } from "@/lib/media/storefront-product-photo";

export type HomeCategoryCardItem = {
  id: string;
  title: string;
  href: string;
  imageUrl: string | null;
  productCount: number;
};

type HomeCategoryCardProps = {
  category: HomeCategoryCardItem;
  productCountLabel: string;
  variant: "desktop" | "tablet";
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
 * Shared home category card — full Figma size on desktop, compact cell on tablet.
 */
export function HomeCategoryCard({
  category,
  productCountLabel,
  variant,
}: HomeCategoryCardProps) {
  const photo = category.imageUrl ?? STOREFRONT_PRODUCT_PHOTO;
  const countLabel = formatProductCount(
    productCountLabel,
    category.productCount,
  );

  if (variant === "tablet") {
    return (
      <AppLink
        href={category.href}
        prefetchPolicy="intent"
        className="relative flex h-[104px] w-full min-w-0 items-center overflow-hidden rounded-[16px] bg-white transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <div className="relative ml-1 h-[96px] w-[38%] max-w-[92px] shrink-0 overflow-hidden rounded-[14px]">
          <Image
            src={photo}
            alt=""
            fill
            sizes="92px"
            className="object-cover object-center"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center px-2 pr-2.5">
          <span className="line-clamp-2 text-[13px] leading-[1.2] font-semibold text-[rgba(34,34,34,0.9)]">
            {category.title}
          </span>
          <span className="mt-1 text-[12px] leading-4 text-black/55">
            {countLabel}
          </span>
        </div>
      </AppLink>
    );
  }

  return (
    <AppLink
      href={category.href}
      prefetchPolicy="intent"
      data-node-id="22:210"
      className="relative z-0 flex h-[135px] w-[376px] items-center overflow-hidden rounded-[20px] bg-white transition-[translate,box-shadow] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:z-10 hover:-translate-y-2 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <CategoryLeafOrnaments />

      <div className="relative ml-1.5 h-[124px] w-[178px] shrink-0 overflow-hidden rounded-[20px]">
        <Image
          src={photo}
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
          {countLabel}
        </span>
      </div>
    </AppLink>
  );
}
