"use client";

import { User } from "lucide-react";

import { BrandHeaderIcon } from "@/components/layout/BrandHeaderIcon";
import { HeaderProfileGlyph } from "@/components/layout/storefront-nav-icons";
import { AppLink } from "@/components/ui/AppLink";
import { IconDropdown } from "@/components/ui/IconDropdown";
import { logoutAction } from "@/features/auth/logout-action";
import type { Locale } from "@/lib/i18n/config";
import type { SessionUser } from "@/lib/auth/session";

type AccountControlsProps = {
  locale: Locale;
  loginLabel: string;
  logoutLabel: string;
  profileLabel: string;
  adminLabel: string;
  user: SessionUser | null;
  tone?: "default" | "onDark" | "onLight" | "pill";
};

const menuItemClassName =
  "block w-full whitespace-nowrap px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900";

function iconButtonClassName(
  tone: "default" | "onDark" | "onLight" | "pill",
  active = false,
): string {
  if (tone === "onDark") {
    const base =
      "inline-flex size-7 shrink-0 items-center justify-center text-white transition-opacity duration-150 hover:opacity-80";
    return active ? `${base} opacity-100` : base;
  }

  if (tone === "pill") {
    const base =
      "inline-flex size-[51px] shrink-0 items-center justify-center rounded-full bg-brand-forest text-white transition-opacity duration-150 hover:opacity-90";
    return active ? `${base} opacity-100` : base;
  }

  if (tone === "onLight") {
    const base =
      "inline-flex size-12 shrink-0 items-center justify-center text-brand-forest transition-opacity duration-150 hover:opacity-80";
    return active ? `${base} opacity-100` : base;
  }

  const base =
    "inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-150";
  return active
    ? `${base} bg-gray-100 text-gray-900 ring-1 ring-gray-200/90`
    : `${base} text-gray-700 hover:text-gray-900`;
}

function AccountIcon({
  tone,
}: {
  tone: "default" | "onDark" | "onLight" | "pill";
}) {
  if (tone === "onDark") {
    return <BrandHeaderIcon name="profile" size={28} />;
  }
  if (tone === "pill") {
    return <HeaderProfileGlyph className="size-[22px]" />;
  }
  return <User className="h-5 w-5" aria-hidden="true" />;
}

export function AccountControls({
  locale,
  loginLabel,
  logoutLabel,
  profileLabel,
  adminLabel,
  user,
  tone = "default",
}: AccountControlsProps) {
  const logoutWithLocale = logoutAction.bind(null, locale);

  if (!user) {
    return (
      <AppLink
        href={`/${locale}/login`}
        prefetchPolicy="intent"
        className={iconButtonClassName(tone)}
        aria-label={loginLabel}
      >
        <AccountIcon tone={tone} />
      </AppLink>
    );
  }

  return (
    <IconDropdown
      label={profileLabel}
      triggerClassName={iconButtonClassName(tone)}
      trigger={<AccountIcon tone={tone} />}
      openOnHover
    >
      {user.role === "ADMIN" ? (
        <AppLink
          href={`/${locale}/admin`}
          prefetchPolicy="intent"
          role="menuitem"
          className={menuItemClassName}
        >
          {adminLabel}
        </AppLink>
      ) : null}
      <AppLink
        href={`/${locale}/profile`}
        prefetchPolicy="intent"
        role="menuitem"
        className={menuItemClassName}
      >
        {profileLabel}
      </AppLink>
      <form action={logoutWithLocale} className="w-full">
        <button type="submit" role="menuitem" className={menuItemClassName}>
          {logoutLabel}
        </button>
      </form>
    </IconDropdown>
  );
}
