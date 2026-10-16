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

function isFactoryMarkPath(pathname: string, locale: Locale): boolean {
  const delivery = `/${locale}/delivery`;
  const catalog = `/${locale}/products`;
  return (
    pathname === delivery ||
    pathname.startsWith(`${delivery}/`) ||
    pathname === catalog ||
    pathname.startsWith(`${catalog}/`)
  );
}

/**
 * Storefront wordmark from Figma (node 22:433) — 136×65.
 * On the home page, click scrolls smoothly to the top instead of remounting.
 */
export function BrandLogo({ locale, brandName, className }: BrandLogoProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const factoryMark = isFactoryMarkPath(pathname, locale);
  const logoSrc = factoryMark
    ? staticAssetUrl("/assets/brand/kamancha-factory-badge.webp", {
        sameOrigin: true,
      })
    : staticAssetUrl("/assets/brand/kamancha-logo.svg");
  const logoClassName =
    className ??
    (factoryMark
      ? "relative inline-flex h-[42px] w-[104px] shrink-0 items-center xl:h-[52px] xl:w-[129px]"
      : "relative inline-flex h-[52px] w-[110px] shrink-0 items-center xl:h-[65px] xl:w-[136px]");

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
      data-node-id={factoryMark ? "704:4057" : undefined}
    >
      <Image
        src={logoSrc}
        alt=""
        width={factoryMark ? 203 : 136}
        height={factoryMark ? 82 : 65}
        priority
        unoptimized
        className="h-full w-full object-contain object-left"
      />
    </AppLink>
  );
}
