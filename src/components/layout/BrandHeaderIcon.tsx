import Image from "next/image";

type BrandHeaderIconName = "cart" | "wishlist" | "profile";

const ICON_SRC: Record<BrandHeaderIconName, string> = {
  cart: "/assets/brand/cart-icon.svg",
  wishlist: "/assets/brand/wishlist-icon.svg",
  profile: "/assets/brand/profile-icon.svg",
};

type BrandHeaderIconProps = {
  name: BrandHeaderIconName;
  /** Display size in px — cart ~26, wishlist/profile ~28. */
  size: number;
  className?: string;
};

/**
 * Kamancha header icons from Figma 22:416 / 22:420 / 22:422.
 */
export function BrandHeaderIcon({
  name,
  size,
  className = "",
}: BrandHeaderIconProps) {
  return (
    <Image
      src={ICON_SRC[name]}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 ${className}`.trim()}
      aria-hidden
    />
  );
}
