"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isHubExperiencePath } from "@/features/home/hub-experience-path";
import type { Locale } from "@/lib/i18n/config";

type StorefrontExperienceChromeProps = {
  locale: Locale;
  children: ReactNode;
};

/**
 * Chat and bottom nav — hidden on hub, visible from delivery onward.
 * Reads the client pathname so chrome updates on in-app navigation.
 */
export function StorefrontExperienceChrome({
  locale,
  children,
}: StorefrontExperienceChromeProps) {
  const pathname = usePathname() ?? "";
  if (isHubExperiencePath(pathname, locale)) {
    return null;
  }
  return children;
}
