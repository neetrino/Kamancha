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
} from "@/features/admin/ui/admin-menu.config";
import { useAdminSidebarCollapse } from "@/features/admin/ui/AdminSidebarCollapseContext";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type AdminSidebarNavProps = {
  locale: Locale;
  pathname: string;
  shell: Dictionary["admin"]["shell"];
  nav: Dictionary["admin"]["nav"];
};

function navIconClass(active: boolean): string {
  return active
    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-brand-forest"
    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white";
}

function navRowClass(active: boolean, collapsed: boolean): string {
  return `relative z-10 flex w-full items-center gap-3 rounded-2xl py-2 text-left font-big-fat-boii text-sm font-normal tracking-wide uppercase ${
    collapsed ? "justify-center px-0" : "px-3"
  } ${active ? "" : "hover:bg-white/40"}`;
}

export function AdminSidebarNav({
  locale,
  pathname,
  nav,
}: AdminSidebarNavProps) {
  const tabs = getAdminMenuItems(locale, nav);
  const { collapsed } = useAdminSidebarCollapse();

  const activeHref =
    [...tabs]
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

      {tabs.map((tab) => {
        const isActive = tab.href === activeHref;

        return (
          <AppLink
            key={tab.id}
            href={tab.href}
            prefetchPolicy="intent"
            title={tab.label}
            ref={(node) => registerItem(tab.href, node)}
            className={navRowClass(isActive, collapsed)}
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
