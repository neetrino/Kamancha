"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { Search, X } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { SITE_HEADER_SEARCH_PILL } from "@/components/layout/site-header-classes";
import { catalogHref } from "@/features/products/application/catalog-search-params";
import {
  searchHeaderProductsAction,
  type HeaderSearchProduct,
} from "@/features/products/application/search-header-products-action";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";
import { storefrontProductImageSrc } from "@/lib/media/storefront-product-photo";

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
  /** Kept for callers; search is always an inline pill field. */
  variant?: "icon" | "pill" | "responsive";
  tone?: "default" | "onDark";
};

/**
 * Inline header search field with a dropdown of live product-name results.
 */
export function HeaderSearch({
  locale,
  currency,
  labels,
}: HeaderSearchProps) {
  const router = useRouter();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [products, setProducts] = useState<HeaderSearchProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const trimmedQuery = query.trim();
  const queryTooShort = trimmedQuery.length < MIN_QUERY_LENGTH;
  const displayProducts = queryTooShort ? [] : products;
  const displaySearchedQuery = queryTooShort ? "" : searchedQuery;
  const showIdle = displaySearchedQuery.length === 0 && !pending;
  const showEmpty =
    displaySearchedQuery.length > 0 && displayProducts.length === 0 && !pending;
  const viewAllHref = catalogHref(locale, {
    q: displaySearchedQuery || trimmedQuery,
    sort: "newest",
    page: 1,
    pageSize: 30,
  });

  useEffect(() => {
    if (!panelOpen) return;

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
  }, [panelOpen, query, locale, currency]);

  useEffect(() => {
    if (!panelOpen) return;

    function handlePointerDown(event: MouseEvent): void {
      const root = rootRef.current;
      if (!root || root.contains(event.target as Node)) return;
      setPanelOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [panelOpen]);

  function clearSearch(): void {
    setQuery("");
    setProducts([]);
    setTotal(0);
    setSearchedQuery("");
    inputRef.current?.focus();
  }

  function closePanel(): void {
    setPanelOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (trimmedQuery.length < MIN_QUERY_LENGTH) return;
    closePanel();
    router.push(viewAllHref);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key !== "Escape") return;
    if (query.length > 0) {
      clearSearch();
      return;
    }
    closePanel();
    inputRef.current?.blur();
  }

  return (
    <div ref={rootRef} className="relative">
      <form onSubmit={handleSubmit} role="search">
        <label htmlFor={inputId} className={SITE_HEADER_SEARCH_PILL}>
          <Search className="h-4 w-4 shrink-0 opacity-90" aria-hidden="true" />
          <span className="sr-only">{labels.open}</span>
          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPanelOpen(true);
            }}
            onFocus={() => setPanelOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={labels.placeholder}
            autoComplete="off"
            size={7}
            className="w-[4.75rem] bg-transparent text-sm font-bold leading-6 text-white outline-none placeholder:text-white/70 [&::-webkit-search-cancel-button]:hidden"
          />
          {query.length > 0 ? (
            <button
              type="button"
              onClick={clearSearch}
              aria-label={labels.close}
              className="inline-flex size-5 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ) : null}
        </label>
      </form>

      {panelOpen ? (
        <div
          className="absolute top-[calc(100%+8px)] right-0 z-50 flex max-h-[min(70vh,420px)] w-[min(calc(100vw-2rem),22rem)] flex-col overflow-hidden rounded-2xl bg-white text-left shadow-xl"
          role="listbox"
          aria-label={labels.open}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {showIdle ? (
              <p className="px-5 py-6 text-center text-sm text-gray-500">
                {labels.idle}
              </p>
            ) : null}
            {pending && displayProducts.length === 0 ? (
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
              <p className="px-5 py-6 text-center text-sm text-gray-500">
                {labels.empty}
              </p>
            ) : null}
            {displayProducts.length > 0 ? (
              <ul
                className={`divide-y divide-gray-100 ${pending ? "opacity-70" : ""}`}
              >
                {displayProducts.map((product) => (
                  <li key={product.id}>
                    <AppLink
                      href={product.href}
                      prefetchPolicy="intent"
                      onClick={closePanel}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={storefrontProductImageSrc(product.imageUrl)}
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
          {displaySearchedQuery && total > displayProducts.length ? (
            <div className="border-t border-gray-200 px-4 py-3">
              <AppLink
                href={viewAllHref}
                prefetchPolicy="intent"
                onClick={closePanel}
                className="block text-center text-sm font-medium text-gray-900 transition-colors hover:text-gray-600"
              >
                {labels.viewAll}
              </AppLink>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
