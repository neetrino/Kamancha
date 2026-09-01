"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { IconDropdown } from "@/components/ui/IconDropdown";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { skipNextHomeMotion } from "@/features/home/ui/use-play-home-motion";
import type { Locale } from "@/lib/i18n/config";
import { localeLabels, locales } from "@/lib/i18n/config";

type LocaleSwitcherProps = {
  locale: Locale;
  label: string;
  menuPlacement?: "bottom" | "top";
  /** Inline EN / РУС / ՀԱՅ control (mobile burger). */
  variant?: "dropdown" | "segmented";
};

const localeShortLabels: Record<Locale, string> = {
  en: "EN",
  ru: "РУС",
  hy: "ՀԱՅ",
};

/** Display order for segmented control: EN / РУС / ՀԱՅ. */
const segmentedLocales: readonly Locale[] = ["en", "ru", "hy"];

function isHomePath(pathname: string, locale: Locale): boolean {
  return pathname === `/${locale}` || pathname === `/${locale}/`;
}

function replaceLocaleInPath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  if (segments.length > 1) {
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }

  return `/${nextLocale}`;
}

export function LocaleSwitcher({
  locale,
  label,
  menuPlacement = "bottom",
  variant = "dropdown",
}: LocaleSwitcherProps) {
  const pathname = usePathname() ?? `/${locale}`;
  const router = useRouter();
  const [activeLocale, setActiveLocale] = useState(locale);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setActiveLocale(locale);
    });
    return () => cancelAnimationFrame(frame);
  }, [locale]);

  if (variant === "segmented") {
    return (
      <SegmentedControl
        aria-label={label}
        value={activeLocale}
        size="sm"
        fullWidth
        options={segmentedLocales.map((item) => ({
          value: item,
          label: localeShortLabels[item],
          href: replaceLocaleInPath(pathname, item),
        }))}
        renderOption={({ option, selected, className }) => (
          <AppLink
            href={option.href ?? `/${option.value}`}
            hrefLang={option.value}
            prefetchPolicy="intent"
            aria-current={selected ? "page" : undefined}
            className={className}
            onClick={() => {
              setActiveLocale(option.value);
              if (isHomePath(pathname, locale)) {
                skipNextHomeMotion();
              }
            }}
            onMouseEnter={() => {
              router.prefetch(option.href ?? `/${option.value}`);
            }}
          >
            {option.label}
          </AppLink>
        )}
      />
    );
  }

  return (
    <IconDropdown
      label={label}
      menuPlacement={menuPlacement}
      trigger={(open) => (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
          {localeLabels[locale]}
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </span>
      )}
    >
      {locales.map((item) => {
        const href = replaceLocaleInPath(pathname, item);
        const selected = item === locale;

        return (
          <AppLink
            key={item}
            href={href}
            hrefLang={item}
            prefetchPolicy="intent"
            role="menuitem"
            aria-current={selected ? "page" : undefined}
            className={
              selected
                ? "flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-[#dcecc6] hover:text-brand-forest"
                : "flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-[#dcecc6] hover:text-brand-forest"
            }
          >
            <span
              className={
                selected
                  ? "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-900 bg-gray-900 text-white"
                  : "flex h-4 w-4 shrink-0 rounded border border-gray-300 bg-white"
              }
              aria-hidden
            >
              {selected ? (
                <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                  <path
                    d="M2.5 6.2 4.8 8.5 9.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
            {localeLabels[item]}
          </AppLink>
        );
      })}
    </IconDropdown>
  );
}
