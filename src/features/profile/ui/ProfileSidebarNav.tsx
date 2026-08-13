"use client";

import type { ReactNode } from "react";
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

function navClassName(active: boolean): string {
  const base =
    "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left font-big-fat-boii text-sm font-normal tracking-wide uppercase transition-colors";
  return active
    ? `${base} bg-white/70 text-brand-forest shadow-sm`
    : `${base} text-gray-700 hover:bg-white/40 hover:text-gray-900`;
}

export function ProfileSidebarNav({
  locale,
  dictionary,
  logoutAction,
}: ProfileSidebarNavProps) {
  const pathname = usePathname();

  const items: NavItem[] = [
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

  return (
    <div className="flex h-full min-h-0 flex-col p-2 sm:p-3">
      <nav
        className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain"
        aria-label={dictionary.title}
      >
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <AppLink
              key={item.href}
              href={item.href}
              prefetchPolicy="intent"
              className={navClassName(active)}
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
              <span>{item.label}</span>
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
