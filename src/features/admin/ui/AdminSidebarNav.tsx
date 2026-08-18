"use client";

import type { CSSProperties } from "react";

import { AppLink } from "@/components/ui/AppLink";
import {
  SLIDING_NAV_TRANSITION_MS,
  useSlidingNavIndicator,
} from "@/components/ui/useSlidingNavIndicator";
import {
  getAdminMenuItems,
  isAdminTabActive,
  type AdminMenuItem,
} from "@/features/admin/ui/admin-menu.config";
import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";
import { useAdminProductsSubnavExpanded } from "@/features/admin/ui/useAdminProductsSubnavExpanded";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminSidebarNavProps = {
  locale: Locale;
  pathname: string;
  shell: Dictionary["admin"]["shell"];
  nav: Dictionary["admin"]["nav"];
};

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

function navIconClass(active: boolean): string {
  return active
    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-brand-forest"
    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white";
}

function navRowClass(active: boolean, collapsed: boolean, indented: boolean): string {
  return `relative z-10 flex w-full items-center gap-3 rounded-2xl py-2 text-left font-big-fat-boii text-sm font-normal tracking-wide uppercase ${
    collapsed ? "justify-center px-0" : "px-3"
  } ${indented && !collapsed ? "pl-10" : ""} ${
    active ? "" : "hover:bg-white/40"
  }`;
}

function AdminProductsNavRow({
  tab,
  isActive,
  expanded,
  toggleLabel,
  onToggle,
  registerItem,
}: {
  tab: AdminMenuItem;
  isActive: boolean;
  expanded: boolean;
  toggleLabel: string;
  onToggle: () => void;
  registerItem: (id: string, node: HTMLElement | null) => void;
}) {
  return (
    <div
      ref={(node) => registerItem(tab.href, node)}
      className="relative z-10 flex w-full min-w-0 overflow-hidden rounded-2xl"
    >
      <AppLink
        href={tab.href}
        prefetchPolicy="intent"
        title={tab.label}
        className={`flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left font-big-fat-boii text-sm font-normal tracking-wide uppercase ${
          isActive ? "" : "hover:bg-white/40"
        }`}
      >
        <span className={navIconClass(isActive)}>{tab.icon}</span>
        <span
          className={`profile-nav-label min-w-0 flex-1 truncate ${
            isActive ? "text-brand-forest" : "text-white"
          }`}
        >
          {tab.label}
        </span>
      </AppLink>
      <button
        type="button"
        aria-expanded={expanded}
        aria-label={toggleLabel}
        title={toggleLabel}
        onClick={(event) => {
          event.preventDefault();
          onToggle();
        }}
        className={`shrink-0 px-2 py-2 transition-colors ${
          isActive
            ? "text-brand-forest hover:bg-black/5"
            : "text-white/80 hover:bg-white/10"
        }`}
      >
        <svg
          className={`h-5 w-5 transition-transform ${expanded ? "" : "-rotate-90"}`}
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

export function AdminSidebarNav({
  locale,
  pathname,
  shell,
  nav,
}: AdminSidebarNavProps) {
  const tabs = getAdminMenuItems(locale, nav);
  const { collapsed } = useAdminSidebarCollapse();
  const [productsNestedExpanded, toggleProductsNested] =
    useAdminProductsSubnavExpanded(pathname, locale);

  const visibleTabs = tabs.filter((tab) =>
    isNestedVisible(
      tab,
      pathname,
      locale,
      collapsed,
      productsNestedExpanded,
    ),
  );

  const activeHref =
    [...visibleTabs]
      .filter((tab) => isAdminTabActive(tab.href, pathname, locale))
      .sort((left, right) => right.href.length - left.href.length)[0]?.href ??
    "";

  const { navRef, indicator, slideEnabled, registerItem } =
    useSlidingNavIndicator(activeHref);

  return (
    <nav
      ref={navRef}
      className="relative z-[2] flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-y-auto p-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      style={
        {
          "--profile-nav-ms": `${SLIDING_NAV_TRANSITION_MS}ms`,
        } as CSSProperties
      }
    >
      {indicator ? (
        <span
          aria-hidden
          className={`pointer-events-none absolute right-0 left-0 z-0 rounded-2xl bg-white/70 shadow-sm ${
            slideEnabled
              ? "profile-nav-indicator"
              : "profile-nav-indicator-instant"
          }`}
          style={{ top: indicator.top, height: indicator.height }}
        />
      ) : null}

      {visibleTabs.map((tab) => {
        const isActive = tab.href === activeHref;

        if (tab.id === "products" && !collapsed) {
          return (
            <AdminProductsNavRow
              key={tab.id}
              tab={tab}
              isActive={isActive}
              expanded={productsNestedExpanded}
              toggleLabel={shell.toggleProductSubpages}
              onToggle={toggleProductsNested}
              registerItem={registerItem}
            />
          );
        }

        return (
          <AppLink
            key={tab.id}
            href={tab.href}
            prefetchPolicy="intent"
            title={tab.label}
            ref={(node) => registerItem(tab.href, node)}
            className={navRowClass(
              isActive,
              collapsed,
              Boolean(tab.isSubCategory),
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={navIconClass(isActive)}>{tab.icon}</span>
            {collapsed ? null : (
              <span
                className={`profile-nav-label min-w-0 flex-1 truncate ${
                  isActive ? "text-brand-forest" : "text-white"
                }`}
              >
                {tab.label}
              </span>
            )}
          </AppLink>
        );
      })}
    </nav>
  );
}
