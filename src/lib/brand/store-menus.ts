import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

const SARYAN_MENU_PATH: Record<Locale, string> = {
  hy: "/assets/menus/saryan-menu-hy.pdf",
  en: "/assets/menus/saryan-menu-en.pdf",
  ru: "/assets/menus/saryan-menu-ru.pdf",
};

function menuPdfUrl(path: string, version: string): string {
  return `${staticAssetUrl(path)}?v=${version}`;
}

/**
 * Locale-specific Saryan food menu PDF (R2 when the CDN base is set).
 */
export function saryanMenuUrl(locale: Locale): string {
  return menuPdfUrl(SARYAN_MENU_PATH[locale], "3");
}

/** Saryan bar menu PDF. */
export function saryanBarMenuUrl(): string {
  return menuPdfUrl("/assets/menus/saryan-bar-menu.pdf", "2");
}

/** Saryan wine menu PDF. */
export function saryanWineMenuUrl(): string {
  return menuPdfUrl("/assets/menus/saryan-wine-menu.pdf", "2");
}
