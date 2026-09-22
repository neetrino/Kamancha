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
/** One continuous expand/collapse under the heading — open and close share timing. */
const PANEL_MS = 560;
const PANEL_EASE =
  "duration-[560ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none";

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
  const closeTimerRef = useRef<number | null>(null);
  const urlQuery = filters.q ?? "";
  const [value, setValue] = useState(urlQuery);
  const [open, setOpen] = useState(urlQuery.length > 0);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current != null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (focusedRef.current) return;
    scheduleStateUpdate(setValue, urlQuery);
    if (urlQuery.length > 0) {
      scheduleStateUpdate(setOpen, true);
    }
  }, [urlQuery]);

  useEffect(() => {
    if (!open) return;
    // Focus after expand finishes so the keyboard does not hitch the motion.
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, PANEL_MS);
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

  function clearCloseTimer(): void {
    if (closeTimerRef.current == null) return;
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setValue(event.target.value);
  }

  function closeSearch(): void {
    focusedRef.current = false;
    inputRef.current?.blur();
    setOpen(false);
    clearCloseTimer();
    // Clear query after the panel finishes collapsing so navigation does not hitch the motion.
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      setValue("");
    }, PANEL_MS);
  }

  function openSearch(): void {
    clearCloseTimer();
    setOpen(true);
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
            openSearch();
          }}
          className={`flex size-11 shrink-0 items-center justify-center rounded-full text-white transition-[background-color,transform] ${PANEL_EASE} hover:bg-white/10 active:scale-95 ${
            open ? "bg-white/10" : "bg-transparent"
          }`}
          aria-label={label}
          aria-expanded={open}
        >
          <Search className="size-6" strokeWidth={2.25} aria-hidden />
        </button>
      </div>

      <div
        className={`grid origin-top transition-[grid-template-rows,transform] ${PANEL_EASE} ${
          open
            ? "grid-rows-[1fr] translate-y-0"
            : "pointer-events-none grid-rows-[0fr] -translate-y-2"
        }`}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden">
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
  );
}
