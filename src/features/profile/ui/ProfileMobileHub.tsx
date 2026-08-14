"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronRight,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Package,
  Phone,
  Trash2,
  User,
} from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { Stagger, StaggerItem } from "@/components/ui/RevealMotion";
import { logoutAction } from "@/features/auth/logout-action";
import { PROFILE_PILL_LIGHT } from "@/features/profile/ui/profile-surface";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { SessionUser } from "@/lib/auth/session";

type ProfileMobileHubProps = {
  locale: Locale;
  user: SessionUser;
  dictionary: Dictionary["profile"];
  /** Opens the dashboard sheet while already on the profile hub route. */
  onOpenDashboard: () => void;
};

type MenuItem = {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
  danger?: boolean;
};

export function ProfileMobileHub({
  locale,
  user,
  dictionary,
  onOpenDashboard,
}: ProfileMobileHubProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const logoutWithLocale = logoutAction.bind(null, locale);
  const displayName = `${user.firstName} ${user.lastName}`.trim();
  const hubHref = `/${locale}/profile`;

  const items: MenuItem[] = [
    {
      href: hubHref,
      label: dictionary.dashboard,
      icon: <LayoutDashboard className="h-5 w-5" />,
      exact: true,
    },
    {
      href: `/${locale}/profile/orders`,
      label: dictionary.orders,
      icon: <Package className="h-5 w-5" />,
    },
    {
      href: `/${locale}/profile/personal-information`,
      label: dictionary.personal,
      icon: <User className="h-5 w-5" />,
    },
    {
      href: `/${locale}/profile/addresses`,
      label: dictionary.addresses,
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      href: `/${locale}/profile/password`,
      label: dictionary.password,
      icon: <Lock className="h-5 w-5" />,
    },
    {
      href: `/${locale}/profile/delete-account`,
      label: dictionary.deleteAccount,
      icon: <Trash2 className="h-5 w-5" />,
      danger: true,
    },
  ];

  const mainItems = items.filter((item) => !item.danger);
  const dangerItem = items.find((item) => item.danger);

  useEffect(() => {
    router.prefetch(`/${locale}/profile`);
    router.prefetch(`/${locale}/profile/orders`);
    router.prefetch(`/${locale}/profile/personal-information`);
    router.prefetch(`/${locale}/profile/addresses`);
    router.prefetch(`/${locale}/profile/password`);
    router.prefetch(`/${locale}/profile/delete-account`);
  }, [locale, router]);

  function isActive(item: MenuItem): boolean {
    if (item.exact) {
      return pathname === item.href || pathname === `${item.href}/`;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  function renderRow(item: MenuItem): ReactNode {
    const active = isActive(item);
    const content = (
      <>
        <span className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              item.danger
                ? "bg-red-50/80 text-red-600"
                : "bg-white/50 text-brand-forest"
            }`}
          >
            {item.icon}
          </span>
          <span
            className={`truncate font-big-fat-boii text-base font-normal tracking-wide uppercase ${
              item.danger ? "text-red-700" : "text-gray-900"
            }`}
          >
            {item.label}
          </span>
        </span>
        <ChevronRight
          className={`h-[18px] w-[18px] shrink-0 ${
            item.danger ? "text-red-400" : "text-gray-500 opacity-80"
          }`}
          aria-hidden
        />
      </>
    );

    if (item.exact) {
      return (
        <button
          key={item.href}
          type="button"
          onClick={onOpenDashboard}
          aria-current={active ? "page" : undefined}
          className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/30"
        >
          {content}
        </button>
      );
    }

    if (item.danger) {
      return (
        <div key={item.href} className="px-3 py-2">
          <AppLink
            href={item.href}
            prefetchPolicy="intent"
            className="flex w-full items-center justify-between rounded-2xl border border-red-200/70 bg-white/35 px-3 py-3 text-left transition-colors hover:bg-red-50/50"
          >
            {content}
          </AppLink>
        </div>
      );
    }

    return (
      <AppLink
        key={item.href}
        href={item.href}
        prefetchPolicy="intent"
        aria-current={active ? "page" : undefined}
        className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-white/30"
      >
        {content}
      </AppLink>
    );
  }

  return (
    <Stagger
      immediate
      className="mx-auto flex w-full max-w-md flex-col gap-4"
    >
      <StaggerItem>
        <section
          className="liquid-glass isolate overflow-hidden rounded-3xl px-4 py-5"
          aria-label={dictionary.title}
        >
          <div className="relative z-[2] flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-forest text-base font-semibold text-white shadow-[0_0_0_3px_rgba(255,255,255,0.45)]">
              {user.firstName.slice(0, 1).toUpperCase()}
              {user.lastName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-big-fat-boii text-xl font-normal leading-tight tracking-wide text-gray-900 uppercase">
                {displayName}
              </p>
              <p className="flex items-center gap-1.5 truncate text-sm leading-snug text-gray-700">
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{user.email}</span>
              </p>
              {user.phone ? (
                <p className="flex items-center gap-1.5 truncate text-sm leading-snug text-gray-700">
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{user.phone}</span>
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </StaggerItem>

      <StaggerItem>
        <nav
          className="liquid-glass isolate overflow-hidden rounded-3xl py-1"
          aria-label={dictionary.title}
        >
          <div className="relative z-[2] divide-y divide-white/35">
            {mainItems.map((item) => renderRow(item))}
          </div>
          {dangerItem ? (
            <div className="relative z-[2]">{renderRow(dangerItem)}</div>
          ) : null}
        </nav>
      </StaggerItem>

      <StaggerItem>
        <form action={logoutWithLocale}>
          <button type="submit" className={`${PROFILE_PILL_LIGHT} w-full gap-2.5`}>
            <LogOut className="h-5 w-5 shrink-0" aria-hidden />
            {dictionary.logout}
          </button>
        </form>
      </StaggerItem>
    </Stagger>
  );
}
