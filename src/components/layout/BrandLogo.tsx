"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

import { AppLink } from "@/components/ui/AppLink";
import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";
import { scrollStorefrontToTop } from "@/lib/navigation/storefront-scroll";

type BrandLogoProps = {
  locale: Locale;
  brandName: string;
  className?: string;
};

function isHomePath(pathname: string, locale: Locale): boolean {
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}

/**
 * Kamancha Factory mark in storefront chrome, including the hub.
 */
export function BrandLogo({ locale, brandName, className }: BrandLogoProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const logoSrc = staticAssetUrl("/assets/brand/hub/factory-badge.webp");
  const logoClassName =
    className ??
    "relative inline-flex h-[42px] w-[104px] shrink-0 items-center xl:h-[60px] xl:w-auto";

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (!isHomePath(pathname, locale)) {
      return;
    }

    event.preventDefault();
    scrollStorefrontToTop(true);
  }

  return (
    <AppLink
      href={`/${locale}`}
      prefetchPolicy="intent"
      onClick={handleClick}
      className={logoClassName}
      aria-label={brandName}
      data-brand-logo
      data-node-id="704:4057"
    >
      <Image
        src={logoSrc}
        alt=""
        width={702}
        height={276}
        priority
        unoptimized
        className="h-full w-auto max-w-none object-contain object-left"
      />
    </AppLink>
  );
}
