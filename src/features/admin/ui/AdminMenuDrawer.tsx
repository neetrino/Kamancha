"use client";

import { useState } from "react";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { AppLink } from "@/components/ui/AppLink";
import { SideSheet } from "@/components/ui/SideSheet";

import {
  getAdminMenuItems,
  isAdminTabActive,
  type AdminMenuItem,
} from "@/features/admin/ui/admin-menu.config";
import { ADMIN_BRAND_LOGO_CLASS } from "@/features/admin/ui/admin-shell-classes";
import { useAdminProductsSubnavExpanded } from "@/features/admin/ui/useAdminProductsSubnavExpanded";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminMenuDrawerProps = {
  locale: Locale;
  pathname: string;
  shell: Dictionary["admin"]["shell"];
  nav: Dictionary["admin"]["nav"];
};

function isNestedVisible(
  tab: AdminMenuItem,
  pathname: string,
  locale: string,
  productsNestedExpanded: boolean,
): boolean {
  if (tab.parentGroupId !== "products") return true;
  if (isAdminTabActive(tab.href, pathname, locale)) return true;
  return productsNestedExpanded;
}

function navIconClass(active: boolean): string {
  return active
    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-brand-forest"
    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white";
}

export function AdminMenuDrawer({
  locale,
  pathname,
  shell,
  nav,
}: AdminMenuDrawerProps) {
  const [open, setOpen] = useState(false);
  const tabs = getAdminMenuItems(locale, nav);
  const [productsNestedExpanded, toggleProductsNested] =
    useAdminProductsSubnavExpanded(pathname, locale);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="admin-menu-drawer-panel"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-12 items-center gap-2 rounded-[70px] bg-white px-6 font-big-fat-boii text-sm font-normal tracking-wide text-brand-forest uppercase"
      >
        {shell.menu}
      </button>

      <SideSheet
        open={open}
        onClose={() => setOpen(false)}
        ariaLabel={shell.adminMenuAria}
        side="left"
        panelClassName="w-1/2 min-w-[16rem] max-w-full"
      >
        <div
          id="admin-menu-drawer-panel"
          className="flex min-h-0 flex-1 flex-col bg-brand-forest"
        >
          <div className="border-b border-white/35 px-4 py-4">
            <BrandLogo
              locale={locale}
              brandName={shell.brandName}
              className={ADMIN_BRAND_LOGO_CLASS}
            />
          </div>

          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            {tabs.map((tab) => {
              if (
                !isNestedVisible(
                  tab,
                  pathname,
                  locale,
                  productsNestedExpanded,
                )
              ) {
                return null;
              }

              const isActive = isAdminTabActive(tab.href, pathname, locale);

              if (tab.id === "products") {
                return (
                  <div
                    key={tab.id}
                    className={`flex w-full overflow-hidden rounded-2xl ${
                      isActive ? "bg-white/70" : ""
                    }`}
                  >
                    <AppLink
                      href={tab.href}
                      prefetchPolicy="intent"
                      onClick={() => setOpen(false)}
                      className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2 font-big-fat-boii text-sm font-normal tracking-wide uppercase"
                    >
                      <span className={navIconClass(isActive)}>{tab.icon}</span>
                      <span
                        className={`truncate ${isActive ? "text-brand-forest" : "text-white"}`}
                      >
                        {tab.label}
                      </span>
                    </AppLink>
                    <button
                      type="button"
                      aria-expanded={productsNestedExpanded}
                      aria-label={shell.toggleProductSubpages}
                      onClick={toggleProductsNested}
                      className={`shrink-0 px-3 py-2 ${
                        isActive ? "text-brand-forest" : "text-white/80"
                      }`}
                    >
                      <svg
                        className={`h-5 w-5 transition-transform ${productsNestedExpanded ? "" : "-rotate-90"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                );
              }

              return (
                <AppLink
                  key={tab.id}
                  href={tab.href}
                  prefetchPolicy="intent"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2 font-big-fat-boii text-sm font-normal tracking-wide uppercase ${
                    tab.isSubCategory ? "pl-10" : ""
                  } ${isActive ? "bg-white/70" : "hover:bg-white/40"}`}
                >
                  <span className={navIconClass(isActive)}>{tab.icon}</span>
                  <span
                    className={`truncate ${isActive ? "text-brand-forest" : "text-white"}`}
                  >
                    {tab.label}
                  </span>
                </AppLink>
              );
            })}
          </nav>
        </div>
      </SideSheet>
    </div>
  );
}
