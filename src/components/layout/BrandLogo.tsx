"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

import { AppLink } from "@/components/ui/AppLink";
import type { Locale } from "@/lib/i18n/config";

type BrandLogoProps = {
  locale: Locale;
  brandName: string;
  className?: string;
};

function isHomePath(pathname: string, locale: Locale): boolean {
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}

/**
 * Storefront wordmark from Figma (node 22:433) — 136×65.
 * On the home page, click scrolls smoothly to the top instead of remounting.
 */
export function BrandLogo({ locale, brandName, className }: BrandLogoProps) {
  const pathname = usePathname() ?? `/${locale}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>): void {
    if (!isHomePath(pathname, locale)) {
      return;
    }

    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <AppLink
      href={`/${locale}`}
      prefetchPolicy="intent"
      onClick={handleClick}
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
