"use client";

import { usePathname } from "next/navigation";

import { AppLink } from "@/components/ui/AppLink";
import type { Locale } from "@/lib/i18n/config";

type NavItem = {
  href: string;
  label: string;
};

type SiteHeaderNavLinksProps = {
  locale: Locale;
  items: readonly NavItem[];
};

function isNavItemActive(
  pathname: string,
  href: string,
  locale: Locale,
): boolean {
  if (href === `/${locale}` || href === `/${locale}/`) {
    return pathname === `/${locale}` || pathname === `/${locale}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClassName(active: boolean): string {
  const base =
    "font-big-fat-boii whitespace-nowrap text-base leading-6 text-white transition-opacity duration-200";
  return active ? `${base} opacity-100` : `${base} opacity-70 hover:opacity-100`;
}

/**
 * Primary desktop nav links with Figma active/inactive opacity.
 */
export function SiteHeaderNavLinks({ locale, items }: SiteHeaderNavLinksProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav aria-label="Primary" className="flex items-center gap-8">
      {items.map((item) => {
        const active = isNavItemActive(pathname, item.href, locale);
        return (
          <AppLink
            key={item.href}
            href={item.href}
            prefetchPolicy="intent"
            className={navLinkClassName(active)}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </AppLink>
        );
      })}
    </nav>
  );
}
