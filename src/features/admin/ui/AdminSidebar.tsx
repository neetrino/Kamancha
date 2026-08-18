"use client";

import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { AdminMenuDrawer } from "@/features/admin/ui/AdminMenuDrawer";
import { AdminSidebarBrand } from "@/features/admin/ui/AdminSidebarBrand";
import { AdminSidebarNav } from "@/features/admin/ui/AdminSidebarNav";
import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";
import {
  ADMIN_BRAND_LOGO_CLASS,
  ADMIN_SIDEBAR_ASIDE,
  ADMIN_SIDEBAR_MOBILE_DRAWER_WRAP,
} from "@/features/admin/ui/admin-shell-classes";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminSidebarProps = {
  locale: Locale;
  shell: Dictionary["admin"]["shell"];
  nav: Dictionary["admin"]["nav"];
};

export function AdminSidebar({ locale, shell, nav }: AdminSidebarProps) {
  const pathname = usePathname() ?? `/${locale}/admin`;
  const { collapsed } = useAdminSidebarCollapse();
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
          <AdminMenuDrawer
            locale={locale}
            pathname={pathname}
            shell={shell}
            nav={nav}
          />
        </div>
      </div>
      <aside className={`${ADMIN_SIDEBAR_ASIDE} ${asideWidthClass}`}>
        <AdminSidebarBrand locale={locale} shell={shell} />
        <AdminSidebarNav
          locale={locale}
          pathname={pathname}
          shell={shell}
          nav={nav}
        />
      </aside>
    </>
  );
}
