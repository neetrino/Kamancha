"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
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
import { PROFILE_NAV_TRANSITION_MS } from "@/features/profile/ui/profile-surface";
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

type IndicatorBox = {
  top: number;
  height: number;
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

function useSlidingNavIndicator(activeHref: string) {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = useState<IndicatorBox | null>(null);
  const [slideEnabled, setSlideEnabled] = useState(false);

  useLayoutEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (!activeHref) {
        setIndicator(null);
        return;
      }
      const link = linkRefs.current.get(activeHref);
      if (!link) return;
      setIndicator({ top: link.offsetTop, height: link.offsetHeight });
    });
    return () => cancelAnimationFrame(frameId);
  }, [activeHref]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setSlideEnabled(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const link = linkRefs.current.get(activeHref);
      if (!link) return;
      setIndicator({ top: link.offsetTop, height: link.offsetHeight });
    });
    observer.observe(nav);
    for (const link of linkRefs.current.values()) {
      observer.observe(link);
    }
    return () => observer.disconnect();
  }, [activeHref]);

  function registerLink(href: string, node: HTMLAnchorElement | null): void {
    if (node) {
      linkRefs.current.set(href, node);
    } else {
      linkRefs.current.delete(href);
    }
  }

  return { navRef, indicator, slideEnabled, registerLink };
}

export function ProfileSidebarNav({
  locale,
  dictionary,
  logoutAction,
}: ProfileSidebarNavProps) {
  const pathname = usePathname() ?? "";
  const items = buildNavItems(locale, dictionary);
  const activeHref =
    items.find((item) => isItemActive(pathname, item))?.href ??
    items[0]?.href ??
    "";
  const { navRef, indicator, slideEnabled, registerLink } =
    useSlidingNavIndicator(activeHref);

  return (
    <div className="flex h-full min-h-0 flex-col p-2 sm:p-3">
      <nav
        ref={navRef}
        className="relative flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain"
        aria-label={dictionary.title}
        style={
          {
            "--profile-nav-ms": `${PROFILE_NAV_TRANSITION_MS}ms`,
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
              ref={(node) => registerLink(item.href, node)}
              className={`relative z-10 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left font-big-fat-boii text-sm font-normal tracking-wide uppercase ${
                active ? "" : "hover:bg-white/40"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={
                  active
                    ? "flex h-8 w-8 items-center justify-center rounded-xl bg-white text-brand-forest"
                    : "flex h-8 w-8 items-center justify-center rounded-xl bg-white/40 text-gray-600"
                }
              >
                {item.icon}
              </span>
              <span
                className={`profile-nav-label min-w-0 flex-1 ${
                  active ? "text-brand-forest" : "text-gray-700"
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
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left font-big-fat-boii text-sm font-normal tracking-wide text-red-700 uppercase transition-colors hover:bg-red-50/70"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50/80 text-red-600">
              <LogOut className="h-4 w-4" />
            </span>
            {dictionary.logout}
          </button>
        </form>
      </div>
    </div>
  );
}
