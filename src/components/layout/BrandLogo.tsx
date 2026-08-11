import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import type { Locale } from "@/lib/i18n/config";

type BrandLogoProps = {
  locale: Locale;
  brandName: string;
  className?: string;
};

/**
 * Storefront wordmark from Figma (node 22:433) — 136×65.
 */
export function BrandLogo({ locale, brandName, className }: BrandLogoProps) {
  return (
    <AppLink
      href={`/${locale}`}
      prefetchPolicy="intent"
      className={
        className ??
        "relative inline-flex h-[52px] w-[110px] shrink-0 items-center md:h-[65px] md:w-[136px]"
      }
      aria-label={brandName}
    >
      <Image
        src="/assets/brand/kamancha-logo.svg"
        alt=""
        width={136}
        height={65}
        priority
        unoptimized
        className="h-full w-full object-contain object-left"
      />
    </AppLink>
  );
}
