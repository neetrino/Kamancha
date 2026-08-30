"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

import { DROPDOWN_ANIMATION_MS } from "@/components/ui/SelectDropdown";

export type MultiSelectOption = {
  label: string;
  value: string;
  hint?: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

type MultiSelectDropdownProps = {
  ariaLabel: string;
  options: ReadonlyArray<MultiSelectOption>;
  values: ReadonlyArray<string>;
  emptyLabel: string;
  title?: string;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  className?: string;
  disabled?: boolean;
  onValuesChange: (values: string[]) => void;
};

function measureMenuPosition(trigger: HTMLElement): MenuPosition {
  const rect = trigger.getBoundingClientRect();
  return {
    top: rect.bottom + 8,
    left: rect.left,
    width: rect.width,
  };
}

export function MultiSelectDropdown({
  ariaLabel,
  options,
  values,
  emptyLabel,
  title,
  searchPlaceholder,
  noResultsLabel = emptyLabel,
  className = "",
  disabled = false,
  onValuesChange,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = new Set(values);
  const wantOpenRef = useRef(false);

  const summary =
    values.length === 0
      ? emptyLabel
      : options
          .filter((option) => selected.has(option.value))
          .map((option) => option.label)
          .join(", ") || emptyLabel;

  const query = search.trim().toLowerCase();
  const visibleOptions = query
    ? options.filter((option) => {
        const haystack = `${option.label} ${option.hint ?? ""}`.toLowerCase();
        return haystack.includes(query);
      })
    : options;

  const closeMenu = useCallback(() => {
    wantOpenRef.current = false;
    setOpen(false);
    setSearch("");
  }, []);

  function openMenu(): void {
    const trigger = rootRef.current;
    if (trigger) setPosition(measureMenuPosition(trigger));
    wantOpenRef.current = true;
    setMounted(true);
  }

  useEffect(() => {
    if (!mounted || !wantOpenRef.current) return;
    let innerFrame = 0;
    const outerFrame = requestAnimationFrame(() => {
      innerFrame = requestAnimationFrame(() => {
        if (wantOpenRef.current) setOpen(true);
      });
    });
    return () => {
      cancelAnimationFrame(outerFrame);
      cancelAnimationFrame(innerFrame);
    };
  }, [mounted]);

  useEffect(() => {
    if (open || !mounted || wantOpenRef.current) return;
    const timer = setTimeout(() => {
      setMounted(false);
      setPosition(null);
    }, DROPDOWN_ANIMATION_MS);
    return () => clearTimeout(timer);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent): void {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      closeMenu();
    }

    function handleReposition(): void {
      const trigger = rootRef.current;
      if (trigger) setPosition(measureMenuPosition(trigger));
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, closeMenu]);

  function toggle(value: string): void {
    if (selected.has(value)) {
      onValuesChange(values.filter((id) => id !== value));
      return;
    }
    onValuesChange([...values, value]);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        className={
          title
            ? "flex w-full items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm outline-none transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            : "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 text-left text-sm text-gray-900 transition hover:border-gray-300 disabled:opacity-40"
        }
      >
        {title ? (
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-0.5 truncate text-sm text-gray-500">{summary}</p>
          </div>
        ) : (
          <span className="min-w-0 flex-1 truncate">{summary}</span>
        )}
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            title ? "mt-1" : ""
          } ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {mounted && position
        ? createPortal(
            <div
              ref={menuRef}
              className={`fixed z-[200] origin-top grid transition-[grid-template-rows,opacity,transform] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                open
                  ? "translate-y-0 grid-rows-[1fr] opacity-100"
                  : "pointer-events-none -translate-y-2 grid-rows-[0fr] opacity-0"
              }`}
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
                transitionDuration: `${DROPDOWN_ANIMATION_MS}ms`,
              }}
              aria-hidden={!open}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-lg">
                  {searchPlaceholder ? (
                    <div className="px-3 pb-2">
                      <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-9 w-full rounded-xl border border-gray-200 px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                      />
                    </div>
                  ) : null}
                  <ul
                    id={listId}
                    role="listbox"
                    aria-multiselectable="true"
                    className="max-h-56 overflow-y-auto"
                  >
                    {visibleOptions.length === 0 ? (
                      <li className="px-4 py-2.5 text-sm text-gray-500">
                        {noResultsLabel}
                      </li>
                    ) : (
                      visibleOptions.map((option) => {
                        const isSelected = selected.has(option.value);
                        return (
                          <li
                            key={option.value}
                            role="option"
                            aria-selected={isSelected}
                          >
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50"
                              onClick={() => toggle(option.value)}
                            >
                              <span
                                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                                  isSelected
                                    ? "border-gray-900 bg-gray-900 text-white"
                                    : "border-gray-300 bg-white"
                                }`}
                                aria-hidden
                              >
                                {isSelected ? (
                                  <Check className="h-3 w-3" />
                                ) : null}
                              </span>
                              <span className="min-w-0 flex-1 truncate">
                                {option.label}
                              </span>
                              {option.hint ? (
                                <span className="max-w-[45%] shrink-0 truncate text-xs text-gray-500">
                                  {option.hint}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
