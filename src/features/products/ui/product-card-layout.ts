export type ProductCardLayout = "fixed" | "fluid" | "compact";

type CardLayoutClasses = {
  article: string;
  image: string;
  imageSizes: string;
  badge: string;
  wishlist: string;
  wishlistSize: "sm" | "md" | "lg" | "xl";
  body: string;
  title: string;
  category: string;
  price: string;
  compare: string;
  metaCol: string;
  star: string;
  rating: string;
  cart: string;
};

const LAYOUT: Record<ProductCardLayout, CardLayoutClasses> = {
  fixed: {
    article: "h-[419px] w-[300px] shrink-0 rounded-[37px]",
    image: "mx-[6px] mt-[7px] h-[220px] rounded-[30px]",
    imageSizes: "287px",
    badge:
      "top-3.5 left-2.5 h-[33px] min-w-[96px] bg-[#84d086] px-3 text-[14px] text-[#132814]",
    wishlist: "top-2.5 right-2 size-10",
    wishlistSize: "xl",
    body: "px-[17px] pt-2 pb-5",
    title: "text-[16px] leading-[30px]",
    category: "-mt-2 text-[16px] leading-[30px]",
    price: "text-[22px]",
    compare: "text-[16px] leading-5",
    metaCol: "ml-2 w-[52px] gap-3",
    star: "size-[18px]",
    rating: "text-[16px]",
    cart: "size-[50px]",
  },
  fluid: {
    article: "h-auto w-full rounded-[24px]",
    image: "mx-1 mt-1 aspect-[5/4] rounded-[16px]",
    imageSizes:
      "(min-width:1280px) 220px, (min-width:1024px) 20vw, (min-width:640px) 40vw, 50vw",
    badge:
      "top-1.5 left-1.5 h-6 min-w-[4.25rem] bg-[#84d086] px-1.5 text-[10px] text-[#132814]",
    wishlist: "top-1.5 right-1.5 size-10",
    wishlistSize: "lg",
    body: "min-h-[5.5rem] gap-1 px-2.5 pt-2 pb-3.5",
    title: "text-[13px] leading-5",
    category: "text-[11px] leading-3.5",
    price: "text-[15px]",
    compare: "text-[11px] leading-3.5",
    metaCol: "ml-1 w-11 gap-2",
    star: "size-3",
    rating: "text-[11px]",
    cart: "size-11 [&_img]:h-5 [&_img]:w-6",
  },
  compact: {
    article: "h-[302px] w-full rounded-[26px]",
    image: "mx-[6px] mt-[7px] h-[166px] rounded-[30px]",
    imageSizes: "201px",
    badge:
      "top-[10px] left-[7px] h-[33px] min-w-[96px] bg-[#140900] px-3 text-[14px] text-white",
    wishlist: "top-2.5 right-2 size-[30px]",
    wishlistSize: "md",
    body: "gap-1 px-[13px] pt-2 pb-3",
    title: "text-[16px] leading-[22px]",
    category: "-mt-0.5 text-[16px] leading-[22px]",
    price: "text-[18px]",
    compare: "text-[14px] leading-[17px]",
    metaCol: "ml-1 w-[52px] gap-2",
    star: "size-[18px]",
    rating: "text-[16px]",
    cart: "size-[50px] [&_img]:h-5 [&_img]:w-6",
  },
};

/** Visual tokens for the three ProductCard layouts. */
export function productCardLayout(layout: ProductCardLayout): CardLayoutClasses {
  return LAYOUT[layout];
}
