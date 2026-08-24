"use client";

import { BrandLogo } from "@/components/layout/BrandLogo";
import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";
import {
  ADMIN_BRAND_LOGO_CLASS,
  ADMIN_BRAND_LOGO_COLLAPSED_CLASS,
} from "@/features/admin/ui/admin-shell-classes";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminSidebarBrandProps = {
  locale: Locale;
  shell: Dictionary["admin"]["shell"];
};

export function AdminSidebarBrand({ locale, shell }: AdminSidebarBrandProps) {
  const { collapsed, toggleCollapsed } = useAdminSidebarCollapse();

  return (
    <div
      className={`flex shrink-0 border-b border-white/20 pb-3 pt-2 ${
        collapsed
          ? "flex-col items-center gap-2 px-1"
          : "items-center justify-between pl-6 pr-2"
      }`}
    >
      <BrandLogo
        locale={locale}
        brandName={shell.brandName}
        className={
          collapsed ? ADMIN_BRAND_LOGO_COLLAPSED_CLASS : ADMIN_BRAND_LOGO_CLASS
        }
      />
      <button
        type="button"
        onClick={toggleCollapsed}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/30 text-white transition-colors hover:bg-white/10"
        aria-expanded={!collapsed}
        aria-label={collapsed ? shell.expandSidebar : shell.collapseSidebar}
        title={collapsed ? shell.expandSidebar : shell.collapseSidebar}
      >
        {collapsed ? (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
