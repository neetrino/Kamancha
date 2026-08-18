"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Lock,
  LogOut,
  MapPin,
  Package,
  Trash2,
  User,
} from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import {
  SLIDING_NAV_TRANSITION_MS,
  useSlidingNavIndicator,
} from "@/components/ui/useSlidingNavIndicator";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type ProfileSidebarNavProps = {
  locale: Locale;
  dictionary: Dictionary["profile"];
  logoutAction: (formData: FormData) => void | Promise<void>;
};

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
};

function buildNavItems(
  locale: Locale,
  dictionary: Dictionary["profile"],
): NavItem[] {
  return [
    {
      href: `/${locale}/profile`,
      label: dictionary.dashboard,
      icon: <LayoutDashboard className="h-4 w-4" />,
      exact: true,
    },
    {
      href: `/${locale}/profile/orders`,
      label: dictionary.orders,
      icon: <Package className="h-4 w-4" />,
    },
    {
      href: `/${locale}/profile/personal-information`,
      label: dictionary.personal,
      icon: <User className="h-4 w-4" />,
    },
    {
      href: `/${locale}/profile/addresses`,
      label: dictionary.addresses,
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      href: `/${locale}/profile/password`,
      label: dictionary.password,
      icon: <Lock className="h-4 w-4" />,
    },
    {
      href: `/${locale}/profile/delete-account`,
      label: dictionary.deleteAccount,
      icon: <Trash2 className="h-4 w-4" />,
    },
  ];
}

function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function ProfileSidebarNav({
  locale,
  dictionary,
  logoutAction,
}: ProfileSidebarNavProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const items = buildNavItems(locale, dictionary);

  useEffect(() => {
    router.prefetch(`/${locale}/profile`);
    router.prefetch(`/${locale}/profile/orders`);
    router.prefetch(`/${locale}/profile/personal-information`);
    router.prefetch(`/${locale}/profile/addresses`);
    router.prefetch(`/${locale}/profile/password`);
    router.prefetch(`/${locale}/profile/delete-account`);
  }, [locale, router]);

  const activeHref =
    items.find((item) => isItemActive(pathname, item))?.href ??
    items[0]?.href ??
    "";
  const { navRef, indicator, slideEnabled, registerItem } =
    useSlidingNavIndicator(activeHref);

  return (
    <div className="flex h-full min-h-0 flex-col p-2 sm:p-3">
      <nav
        ref={navRef}
        className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        aria-label={dictionary.title}
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

        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <AppLink
              key={item.href}
              href={item.href}
              prefetchPolicy="intent"
              ref={(node) => registerItem(item.href, node)}
              className={`relative z-10 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left font-big-fat-boii text-sm font-normal tracking-wide uppercase ${
                active ? "" : "hover:bg-white/40"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={
                  active
                    ? "flex h-8 w-8 items-center justify-center rounded-xl bg-white text-brand-forest"
                    : "flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white"
                }
              >
                {item.icon}
              </span>
              <span
                className={`profile-nav-label min-w-0 flex-1 ${
                  active ? "text-brand-forest" : "text-white"
                }`}
              >
                {item.label}
              </span>
            </AppLink>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-white/35 pt-2">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-2xl border border-white/50 bg-white/15 px-3.5 py-2.5 text-left font-big-fat-boii text-sm font-normal tracking-wide text-white uppercase shadow-sm transition-colors hover:bg-white/25"
          >
            <span className="shrink-0 text-white">
              <LogOut className="h-4 w-4" aria-hidden />
            </span>
            {dictionary.logout}
          </button>
        </form>
      </div>
    </div>
  );
}
