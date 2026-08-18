"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/layout/BrandLogo";
import {
  getAdminMenuItems,
  isAdminTabActive,
  type AdminMenuItem,
} from "@/features/admin/ui/admin-menu.config";
import { AdminMenuDrawer } from "@/features/admin/ui/AdminMenuDrawer";
import { AdminSidebarBrand } from "@/features/admin/ui/AdminSidebarBrand";
import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";
import {
  ADMIN_BRAND_LOGO_CLASS,
  ADMIN_SIDEBAR_ASIDE,
  ADMIN_SIDEBAR_MOBILE_DRAWER_WRAP,
  ADMIN_SIDEBAR_NAV,
} from "@/features/admin/ui/admin-shell-classes";
import { useAdminProductsSubnavExpanded } from "@/features/admin/ui/useAdminProductsSubnavExpanded";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminSidebarProps = {
  locale: Locale;
  shell: Dictionary["admin"]["shell"];
  nav: Dictionary["admin"]["nav"];
};

const ADMIN_NAV_ACTIVE = "bg-white text-brand-forest";
const ADMIN_NAV_IDLE =
  "text-white/85 hover:bg-white/10 hover:text-white";

function isNestedVisible(
  tab: AdminMenuItem,
  pathname: string,
  locale: string,
  collapsed: boolean,
  productsNestedExpanded: boolean,
): boolean {
  if (tab.parentGroupId !== "products") return true;
  if (collapsed) return true;
  if (isAdminTabActive(tab.href, pathname, locale)) return true;
  return productsNestedExpanded;
}

export function AdminSidebar({ locale, shell, nav }: AdminSidebarProps) {
  const pathname = usePathname() ?? `/${locale}/admin`;
  const tabs = getAdminMenuItems(locale, nav);
  const { collapsed } = useAdminSidebarCollapse();
  const [productsNestedExpanded, toggleProductsNested] =
    useAdminProductsSubnavExpanded(pathname, locale);

  const asideWidthClass = collapsed ? "lg:w-16" : "lg:w-64";

  return (
    <>
      <div className={ADMIN_SIDEBAR_MOBILE_DRAWER_WRAP}>
        <div className="flex items-center justify-between gap-3">
          <div className="rounded-lg bg-brand-forest px-2.5 py-1.5">
            <BrandLogo
              locale={locale}
              brandName={shell.brandName}
              className={ADMIN_BRAND_LOGO_CLASS}
            />
          </div>
          <AdminMenuDrawer locale={locale} pathname={pathname} shell={shell} nav={nav} />
        </div>
      </div>
      <aside className={`${ADMIN_SIDEBAR_ASIDE} ${asideWidthClass}`}>
        <AdminSidebarBrand locale={locale} shell={shell} />
        <nav
          className={`${ADMIN_SIDEBAR_NAV} ${collapsed ? "px-1" : "px-2"}`}
        >
          {tabs.map((tab) => {
            if (
              !isNestedVisible(
                tab,
                pathname,
                locale,
                collapsed,
                productsNestedExpanded,
              )
            ) {
              return null;
            }

            const isActive = isAdminTabActive(tab.href, pathname, locale);
            const rowClasses = `flex w-full items-center rounded-md text-sm font-medium transition-all ${
              collapsed ? "justify-center px-0 py-3" : "gap-3 px-4 py-3"
            } ${tab.isSubCategory && !collapsed ? "pl-12" : ""} ${
              isActive ? ADMIN_NAV_ACTIVE : ADMIN_NAV_IDLE
            }`;

            if (tab.id === "products" && !collapsed) {
              return (
                <div
                  key={tab.id}
                  className={`flex w-full min-w-0 overflow-hidden rounded-md ${
                    isActive ? ADMIN_NAV_ACTIVE : "bg-transparent"
                  }`}
                >
                  <Link
                    href={tab.href}
                    title={tab.label}
                    className={`flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-all ${
                      isActive
                        ? "text-brand-forest hover:bg-white/90"
                        : ADMIN_NAV_IDLE
                    }`}
                  >
                    <span
                      className={`shrink-0 ${isActive ? "text-brand-forest" : "text-white/70"}`}
                    >
                      {tab.icon}
                    </span>
                    <span className="min-w-0 truncate">{tab.label}</span>
                  </Link>
                  <button
                    type="button"
                    aria-expanded={productsNestedExpanded}
                    aria-label={shell.toggleProductSubpages}
                    title={shell.toggleProductSubpages}
                    onClick={(event) => {
                      event.preventDefault();
                      toggleProductsNested();
                    }}
                    className={`shrink-0 border-l px-2 py-3 transition-colors ${
                      isActive
                        ? "border-brand-forest/20 text-brand-forest hover:bg-black/5"
                        : "border-white/20 text-white/80 hover:bg-white/10"
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
              <Link
                key={tab.id}
                href={tab.href}
                title={tab.label}
                className={rowClasses}
              >
                <span
                  className={`shrink-0 ${isActive ? "text-brand-forest" : "text-white/70"}`}
                >
                  {tab.icon}
                </span>
                {collapsed ? null : (
                  <span className="min-w-0 truncate">{tab.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
