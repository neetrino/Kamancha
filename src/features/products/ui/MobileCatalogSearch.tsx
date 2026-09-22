"use client";

import { Search, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";

import { Reveal } from "@/components/ui/RevealMotion";
import { catalogHref } from "@/features/products/application/catalog-search-params";
import type { CatalogFilters } from "@/features/products/schemas/catalog-list";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";

const SEARCH_DEBOUNCE_MS = 300;
/** Match storefront drawer/menu easing — height + soft fade/slide. */
const FOCUS_DELAY_MS = 160;
const EXPAND_EASE =
  "duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none";

type MobileCatalogSearchProps = {
  heading: string;
  locale: string;
  filters: CatalogFilters;
  label: string;
  placeholder: string;
  clearLabel: string;
};

/**
 * Mobile menu header — MENU + search icon; field opens below and pushes categories.
 */
export function MobileCatalogSearch({
  heading,
  locale,
  filters,
  label,
  placeholder,
  clearLabel,
}: MobileCatalogSearchProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const focusedRef = useRef(false);
  const urlQuery = filters.q ?? "";
  const [value, setValue] = useState(urlQuery);
  const [open, setOpen] = useState(urlQuery.length > 0);

  useEffect(() => {
    if (focusedRef.current) return;
    scheduleStateUpdate(setValue, urlQuery);
    if (urlQuery.length > 0) {
      scheduleStateUpdate(setOpen, true);
    }
  }, [urlQuery]);

  useEffect(() => {
    if (!open) return;
    // Focus after the expand starts so the keyboard does not hitch the animation.
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, FOCUS_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const trimmed = value.trim();
    const next = trimmed.length === 0 ? undefined : trimmed;
    const current = urlQuery.trim().length === 0 ? undefined : urlQuery.trim();
    if (next === current) return;

    const delay = next == null ? 0 : SEARCH_DEBOUNCE_MS;
    const timer = window.setTimeout(() => {
      startTransition(() => {
        router.replace(
          catalogHref(locale, filters, { q: next, page: 1 }),
          { scroll: false },
        );
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [filters, locale, router, urlQuery, value]);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setValue(event.target.value);
  }

  function closeSearch(): void {
    setValue("");
    setOpen(false);
  }

  return (
    <div className="xl:hidden">
      <div className="flex items-center justify-between gap-3 pb-[9px] pt-0">
        <Reveal immediate className="min-w-0">
          <h1 className="font-big-fat-boii text-[40px] leading-[1.1] font-normal text-white sm:text-[48px]">
            {heading}
          </h1>
        </Reveal>
        <button
          type="button"
          onClick={() => {
            if (open) {
              closeSearch();
              return;
            }
            setOpen(true);
          }}
          className={`flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-[background-color,transform] ${EXPAND_EASE} hover:bg-white/10 active:scale-95 ${
            open ? "bg-white/10" : "bg-transparent"
          }`}
          aria-label={label}
          aria-expanded={open}
        >
          <Search className="size-6" strokeWidth={2.25} aria-hidden />
        </button>
      </div>

      <div
        className={`grid transition-[grid-template-rows] ${EXPAND_EASE} ${
          open ? "grid-rows-[1fr]" : "pointer-events-none grid-rows-[0fr]"
        }`}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`origin-top transition-[opacity,transform] ${EXPAND_EASE} ${
              open
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0"
            }`}
          >
            <label className="mb-3 flex h-11 w-full items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 text-white transition-colors focus-within:border-white/45 focus-within:bg-white/15">
              <span className="sr-only">{label}</span>
              <Search className="size-4 shrink-0 text-white/70" aria-hidden />
              <input
                ref={inputRef}
                type="search"
                value={value}
                onChange={handleChange}
                onFocus={() => {
                  focusedRef.current = true;
                }}
                onBlur={() => {
                  focusedRef.current = false;
                }}
                placeholder={placeholder}
                autoComplete="off"
                enterKeyHint="search"
                tabIndex={open ? undefined : -1}
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/55 [&::-webkit-search-cancel-button]:hidden"
              />
              {value.length > 0 ? (
                <button
                  type="button"
                  onClick={closeSearch}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={clearLabel}
                >
                  <X className="size-4" aria-hidden />
                </button>
              ) : null}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
