"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { HeaderMenuIcon } from "@/components/layout/storefront-nav-icons";
import { AppLink } from "@/components/ui/AppLink";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

const MENU_TRANSITION_MS = 320;
const MENU_GAP_PX = 8;
const MENU_INSET_PX = 12;
const MOBILE_HEADER_PILL_SELECTOR = "[data-mobile-header-pill]";
const TRIGGER_MOTION =
  "motion-reduce:transition-none transition-[opacity,transform] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform]";

type NavItem = {
  href: string;
  label: string;
};

type MobileNavDrawerProps = {
  locale: Locale;
  dictionary: Dictionary;
  navItems: readonly NavItem[];
  /** Override the menu trigger button classes (home header pill). */
  triggerClassName?: string;
  /** Extra controls inside the panel (locale/currency on home). */
  panelFooter?: ReactNode;
  /** When true, Figma 181:504 forest hamburger (34px). */
  forestTrigger?: boolean;
};

function isNavItemActive(pathname: string, href: string, locale: Locale): boolean {
  if (href === `/${locale}` || href === `/${locale}/`) {
    return pathname === `/${locale}` || pathname === `/${locale}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * MaMarie-style mobile nav: floating rounded panel under the header pill,
 * full-screen scrim with only the header pill kept sharp above the blur.
 */
export function MobileNavDrawer({
  locale,
  dictionary,
  navItems,
  triggerClassName,
  panelFooter,
  forestTrigger = false,
}: MobileNavDrawerProps) {
  const menuId = useId();
  const pathname = usePathname() ?? "";
  const panelRef = useRef<HTMLDivElement>(null);
  const exitTimerRef = useRef<number | null>(null);
  const renderedRef = useRef(false);
  const pillParentRef = useRef<HTMLElement | null>(null);
  const pillNextSiblingRef = useRef<Node | null>(null);
  const pillPlaceholderRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [panelTopPx, setPanelTopPx] = useState(72);

  const clearExitTimer = useCallback(() => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const measurePanelTop = useCallback(() => {
    const pill = document.querySelector<HTMLElement>(MOBILE_HEADER_PILL_SELECTOR);
    if (pill) {
      setPanelTopPx(pill.getBoundingClientRect().bottom);
      return;
    }

    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;
    setPanelTopPx(header.getBoundingClientRect().bottom);
  }, []);

  const elevateHeaderPill = useCallback(() => {
    const pill = document.querySelector<HTMLElement>(MOBILE_HEADER_PILL_SELECTOR);
    if (!pill || pill.dataset.elevated === "true") return;

    const rect = pill.getBoundingClientRect();
    pillParentRef.current = pill.parentElement;
    pillNextSiblingRef.current = pill.nextSibling;

    const placeholder = document.createElement("div");
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.flexShrink = "0";
    pillPlaceholderRef.current = placeholder;
    pillParentRef.current?.insertBefore(placeholder, pill);

    document.body.appendChild(pill);
    pill.dataset.elevated = "true";
    pill.style.position = "fixed";
    pill.style.top = `${rect.top}px`;
    pill.style.left = `${rect.left}px`;
    pill.style.width = `${rect.width}px`;
    pill.style.height = `${rect.height}px`;
    pill.style.zIndex = "100";
  }, []);

  const restoreHeaderPill = useCallback(() => {
    const pill = document.querySelector<HTMLElement>(MOBILE_HEADER_PILL_SELECTOR);
    if (!pill || pill.dataset.elevated !== "true" || !pillParentRef.current) {
      return;
    }

    if (pillNextSiblingRef.current) {
      pillParentRef.current.insertBefore(pill, pillNextSiblingRef.current);
    } else {
      pillParentRef.current.appendChild(pill);
    }

    pillPlaceholderRef.current?.remove();
    pillPlaceholderRef.current = null;
    pillParentRef.current = null;
    pillNextSiblingRef.current = null;

    delete pill.dataset.elevated;
    pill.style.position = "";
    pill.style.top = "";
    pill.style.left = "";
    pill.style.width = "";
    pill.style.height = "";
    pill.style.zIndex = "";
  }, []);

  const openMenu = useCallback(() => {
    clearExitTimer();
    measurePanelTop();
    renderedRef.current = true;
    setRendered(true);
    setExpanded(false);
    requestAnimationFrame(() => {
      elevateHeaderPill();
      measurePanelTop();
      requestAnimationFrame(() => {
        setExpanded(true);
      });
    });
  }, [clearExitTimer, elevateHeaderPill, measurePanelTop]);

  const closeMenu = useCallback(() => {
    clearExitTimer();
    setExpanded(false);
    exitTimerRef.current = window.setTimeout(() => {
      renderedRef.current = false;
      setRendered(false);
      exitTimerRef.current = null;
      requestAnimationFrame(() => {
        restoreHeaderPill();
      });
    }, MENU_TRANSITION_MS);
  }, [clearExitTimer, restoreHeaderPill]);

  const toggleMenu = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  useEffect(() => {
    setMounted(true);
    return () => clearExitTimer();
  }, [clearExitTimer]);

  useEffect(() => {
    if (open) {
      openMenu();
      return;
    }
    if (!renderedRef.current) return;
    closeMenu();
  }, [open, openMenu, closeMenu]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    function closeOnDesktop(): void {
      if (media.matches) setOpen(false);
    }
    closeOnDesktop();
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (rendered) {
      document.body.dataset.mobileNavOpen = "true";
    } else {
      delete document.body.dataset.mobileNavOpen;
    }

    return () => {
      delete document.body.dataset.mobileNavOpen;
    };
  }, [rendered]);

  useLayoutEffect(() => {
    if (!rendered) return;

    function syncLayout(): void {
      if (open) {
        elevateHeaderPill();
      }
      measurePanelTop();
    }

    syncLayout();
    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, [rendered, open, elevateHeaderPill, measurePanelTop]);

  useEffect(() => {
    return () => {
      restoreHeaderPill();
    };
  }, [restoreHeaderPill]);

  useEffect(() => {
    if (!rendered) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }

    function handleTouchMove(event: TouchEvent): void {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      const pill = document.querySelector(MOBILE_HEADER_PILL_SELECTOR);
      if (pill?.contains(target)) return;
      event.preventDefault();
    }

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered]);

  const homeHref = `/${locale}`;
  const productsHref = `/${locale}/products`;
  const drawerNavItems = navItems.filter(
    (item) =>
      item.href !== homeHref &&
      item.href !== `${homeHref}/` &&
      item.href !== productsHref,
  );

  return (
    <>
      <button
        type="button"
        onClick={toggleMenu}
        className={
          triggerClassName ??
          "relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/15 text-white transition-opacity hover:opacity-80 touch-manipulation sm:h-10 sm:w-10"
        }
        aria-label={expanded ? dictionary.nav.closeMenu : dictionary.nav.openMenu}
        aria-expanded={expanded}
        aria-controls={menuId}
        data-mobile-nav-trigger
      >
        {forestTrigger ? (
          <span
            className={`pointer-events-none absolute inset-0 flex items-center justify-center text-brand-forest ${TRIGGER_MOTION}`}
            style={{
              opacity: expanded ? 0 : 1,
              transform: expanded ? "rotate(45deg)" : "rotate(0deg)",
            }}
          >
            <HeaderMenuIcon className="size-[34px]" />
          </span>
        ) : (
          <span
            className={`pointer-events-none absolute inset-0 flex items-center justify-center ${TRIGGER_MOTION}`}
            style={{
              opacity: expanded ? 0 : 1,
              transform: expanded ? "rotate(45deg)" : "rotate(0deg)",
            }}
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </span>
        )}
        <span
          className={`pointer-events-none absolute inset-0 flex items-center justify-center ${TRIGGER_MOTION} ${
            forestTrigger ? "text-brand-forest" : ""
          }`}
          aria-hidden="true"
          style={{
            opacity: expanded ? 1 : 0,
            transform: expanded ? "rotate(0deg)" : "rotate(-45deg)",
          }}
        >
          <X
            className={forestTrigger ? "size-6" : "h-4 w-4 sm:h-5 sm:w-5"}
            strokeWidth={2.5}
          />
        </span>
      </button>

      {mounted && rendered
        ? createPortal(
            <div className="md:hidden">
              <button
                type="button"
                aria-label={dictionary.nav.closeMenu}
                className={`fixed inset-0 z-[85] cursor-pointer border-0 bg-black/25 backdrop-blur-[8px] motion-reduce:transition-none transition-opacity duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  expanded
                    ? "pointer-events-auto opacity-100"
                    : "pointer-events-none opacity-0"
                }`}
                onClick={() => setOpen(false)}
              />
              <div
                ref={panelRef}
                id={menuId}
                role="dialog"
                aria-modal="true"
                aria-label={dictionary.nav.navigation}
                className={`fixed z-[90] origin-top-right overflow-hidden rounded-[20px] bg-white px-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] motion-reduce:transition-none motion-reduce:transform-none transition-[opacity,transform] duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  expanded
                    ? "translate-y-0 scale-100 opacity-100"
                    : "-translate-y-3 scale-[0.96] opacity-0"
                }`}
                style={{
                  top: panelTopPx + MENU_GAP_PX,
                  left: MENU_INSET_PX,
                  right: MENU_INSET_PX,
                  maxHeight: `calc(100dvh - ${panelTopPx + MENU_GAP_PX + MENU_INSET_PX}px)`,
                }}
              >
                <nav
                  aria-label={dictionary.nav.navigation}
                  className="flex max-h-inherit flex-col overflow-y-auto pb-[max(0.5rem,env(safe-area-inset-bottom))]"
                >
                  <div className="flex flex-col py-3">
                    {drawerNavItems.map((item) => {
                      const active = isNavItemActive(
                        pathname,
                        item.href,
                        locale,
                      );
                      return (
                        <AppLink
                          key={item.href}
                          href={item.href}
                          prefetchPolicy="intent"
                          aria-current={active ? "page" : undefined}
                          className={`rounded-xl px-1 py-3.5 font-big-fat-boii text-lg transition-colors ${
                            active
                              ? "text-gray-900"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </AppLink>
                      );
                    })}
                  </div>

                  {panelFooter ? (
                    <div className="mt-1 flex flex-col gap-2 border-t border-gray-100 py-4">
                      {panelFooter}
                    </div>
                  ) : null}
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
