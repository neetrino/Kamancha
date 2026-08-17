"use client";

import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type AnimationEvent,
} from "react";
import { createPortal } from "react-dom";
import { Search, X } from "lucide-react";

import { SITE_HEADER_SEARCH_PILL } from "@/components/layout/site-header-classes";
import { AppLink } from "@/components/ui/AppLink";
import { catalogHref } from "@/features/products/application/catalog-search-params";
import {
  searchHeaderProductsAction,
  type HeaderSearchProduct,
} from "@/features/products/application/search-header-products-action";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";
import { STOREFRONT_PRODUCT_PHOTO } from "@/lib/media/storefront-product-photo";

const SEARCH_EXIT_MS = 320;
const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 1;

type HeaderSearchLabels = {
  open: string;
  close: string;
  placeholder: string;
  idle: string;
  empty: string;
  viewAll: string;
};

type HeaderSearchProps = {
  locale: Locale;
  currency: Currency;
  labels: HeaderSearchLabels;
  /**
   * `pill` — Figma desktop field.
   * `icon` — compact control.
   * `responsive` — icon below `lg`, pill from `lg` up.
   */
  variant?: "icon" | "pill" | "responsive";
  /** Icon button color on dark header. */
  tone?: "default" | "onDark";
};

/**
 * Header search control + centered popup with live product name results.
 */
export function HeaderSearch({
  locale,
  currency,
  labels,
  variant = "icon",
  tone = "default",
}: HeaderSearchProps) {
  const titleId = useId();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<HeaderSearchProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setExiting(false);
      setRendered(true);
      return;
    }

    if (!rendered) return;

    setExiting(true);
    const timer = window.setTimeout(() => {
      finishExit();
    }, SEARCH_EXIT_MS);

    return () => window.clearTimeout(timer);
  }, [open, rendered]);

  useEffect(() => {
    if (!rendered || exiting) return;

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 40);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered, exiting]);

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      requestIdRef.current += 1;
      setProducts([]);
      setTotal(0);
      setSearchedQuery("");
      return;
    }

    const requestId = ++requestIdRef.current;
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const result = await searchHeaderProductsAction(
          locale,
          currency,
          trimmed,
        );
        if (requestId !== requestIdRef.current) return;
        setProducts(result.products);
        setTotal(result.total);
        setSearchedQuery(result.query);
      });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [open, query, locale, currency]);

  function closePopup(): void {
    setOpen(false);
  }

  function finishExit(): void {
    setRendered(false);
    setExiting(false);
    setQuery("");
    setProducts([]);
    setTotal(0);
    setSearchedQuery("");
  }

  function handlePanelAnimationEnd(event: AnimationEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) return;
    if (!event.animationName.includes("confirm-dialog-panel-out")) return;
    finishExit();
  }

  const backdropClass = exiting
    ? "animate-confirm-dialog-backdrop-out"
    : "animate-confirm-dialog-backdrop-in";
  const panelClass = exiting
    ? "animate-confirm-dialog-panel-out"
    : "animate-confirm-dialog-panel-in";

  const showIdle = searchedQuery.length === 0 && !pending;
  const showEmpty =
    searchedQuery.length > 0 && products.length === 0 && !pending;
  const viewAllHref = catalogHref(locale, {
    q: searchedQuery || query.trim(),
    sort: "newest",
    page: 1,
    pageSize: 24,
  });

  const iconToneClass =
    tone === "onDark"
      ? "text-white hover:text-white/90"
      : "text-gray-700 hover:text-gray-900";

  const showPill = variant === "pill" || variant === "responsive";
  const showIcon = variant === "icon" || variant === "responsive";
  const pillClass =
    variant === "responsive"
      ? `hidden md:flex ${SITE_HEADER_SEARCH_PILL}`
      : `flex ${SITE_HEADER_SEARCH_PILL}`;
  const iconClass =
    variant === "responsive"
      ? `relative inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-150 md:hidden ${iconToneClass}`
      : `relative inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors duration-150 ${iconToneClass}`;

  return (
    <>
      {showPill ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={labels.open}
          className={pillClass}
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="leading-6">{labels.placeholder}</span>
        </button>
      ) : null}

      {showIcon ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={labels.open}
          className={iconClass}
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}

      {mounted && rendered
        ? createPortal(
            <div
              className="fixed inset-0 z-[300] flex items-start justify-center p-4 pt-[12vh] sm:pt-[15vh]"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                className={`absolute inset-0 cursor-pointer bg-black/30 backdrop-blur-md ${backdropClass}`}
                aria-label={labels.close}
                onClick={closePopup}
              />
              <div
                className={`relative z-[1] flex max-h-[min(70vh,560px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-xl ${panelClass}`}
                onAnimationEnd={handlePanelAnimationEnd}
              >
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
                    <Search
                      className="h-5 w-5 shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                    <label htmlFor={inputId} className="sr-only" id={titleId}>
                      {labels.open}
                    </label>
                    <input
                      ref={inputRef}
                      id={inputId}
                      type="text"
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={labels.placeholder}
                      autoComplete="off"
                      className="min-w-0 flex-1 bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={closePopup}
                      aria-label={labels.close}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-800 transition-colors hover:bg-gray-200"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                    {showIdle ? (
                      <p className="px-5 py-8 text-center text-sm text-gray-500">
                        {labels.idle}
                      </p>
                    ) : null}

                    {pending && products.length === 0 ? (
                      <div className="space-y-3 px-4 py-4" aria-hidden="true">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="flex animate-pulse items-center gap-3"
                          >
                            <div className="h-14 w-14 rounded-lg bg-gray-100" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-3/4 rounded bg-gray-100" />
                              <div className="h-3 w-1/3 rounded bg-gray-100" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {showEmpty ? (
                      <p className="px-5 py-8 text-center text-sm text-gray-500">
                        {labels.empty}
                      </p>
                    ) : null}

                    {products.length > 0 ? (
                      <ul
                        className={`divide-y divide-gray-100 ${pending ? "opacity-70" : ""}`}
                      >
                        {products.map((product) => (
                          <li key={product.id}>
                            <AppLink
                              href={product.href}
                              prefetchPolicy="intent"
                              onClick={closePopup}
                              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                            >
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                <Image
                                  src={STOREFRONT_PRODUCT_PHOTO}
                                  alt=""
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-gray-900">
                                  {product.title}
                                </p>
                                <p className="mt-0.5 text-sm text-gray-600">
                                  {product.compareAtFormatted ? (
                                    <>
                                      <span className="mr-2 text-gray-400 line-through">
                                        {product.compareAtFormatted}
                                      </span>
                                      <span>{product.priceFormatted}</span>
                                    </>
                                  ) : (
                                    product.priceFormatted
                                  )}
                                </p>
                              </div>
                            </AppLink>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {searchedQuery && total > products.length ? (
                    <div className="border-t border-gray-200 px-4 py-3">
                      <AppLink
                        href={viewAllHref}
                        prefetchPolicy="intent"
                        onClick={closePopup}
                        className="block text-center text-sm font-medium text-gray-900 transition-colors hover:text-gray-600"
                      >
                        {labels.viewAll}
                      </AppLink>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
