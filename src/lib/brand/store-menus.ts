import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const SARYAN_MENU_PATH: Record<Locale, string> = {
  hy: "/assets/menus/saryan-menu-hy.pdf",
  en: "/assets/menus/saryan-menu-en.pdf",
  ru: "/assets/menus/saryan-menu-ru.pdf",
};

function sameOriginPdf(path: string, version: string): string {
  return `${staticAssetUrl(path, { sameOrigin: true })}?v=${version}`;
}

/**
 * Locale-specific Saryan food menu PDF — served from the app origin.
 */
export function saryanMenuUrl(locale: Locale): string {
  return sameOriginPdf(SARYAN_MENU_PATH[locale], "1");
}

/** Saryan bar menu PDF. */
export function saryanBarMenuUrl(): string {
  return sameOriginPdf("/assets/menus/saryan-bar-menu.pdf", "2");
}

/** Saryan wine menu PDF. */
export function saryanWineMenuUrl(): string {
  return sameOriginPdf("/assets/menus/saryan-wine-menu.pdf", "2");
}
