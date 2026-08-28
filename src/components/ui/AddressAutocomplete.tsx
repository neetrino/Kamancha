"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

import { autocompleteAddressAction } from "@/features/delivery/application/autocomplete-address";
import type { PlaceAutocompleteSuggestion } from "@/lib/maps/types";
import { useIsClient } from "@/lib/react/use-is-client";

const DEBOUNCE_MS = 280;

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

type AddressAutocompleteProps = {
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  languageCode?: "hy" | "en" | "ru";
  autoComplete?: string;
};

function measureMenuPosition(anchor: HTMLElement): MenuPosition {
  const rect = anchor.getBoundingClientRect();
  return {
    top: rect.bottom + 4,
    left: rect.left,
    width: rect.width,
  };
}

export function AddressAutocomplete({
  name,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  required = false,
  className = "",
  languageCode = "hy",
  autoComplete = "street-address",
}: AddressAutocompleteProps) {
  const listId = useId();
  const mounted = useIsClient();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceAutocompleteSuggestion[]>(
    [],
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  function syncPosition(): void {
    const input = inputRef.current;
    if (!input) return;
    setPosition(measureMenuPosition(input));
  }

  useLayoutEffect(() => {
    if (!open || suggestions.length === 0) return;
    syncPosition();
  }, [open, suggestions.length]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent): void {
      const target = event.target as Node;
      if (
        rootRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setHighlightIndex(-1);
    }

    function onReposition(): void {
      syncPosition();
    }

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current);
      }
      requestIdRef.current += 1;
    };
  }, []);

  function clearSuggestions(): void {
    setSuggestions([]);
    setOpen(false);
    setPending(false);
    setError(null);
    setHighlightIndex(-1);
    setPosition(null);
  }

  function scheduleFetch(input: string): void {
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
    }

    const trimmed = input.trim();
    if (trimmed.length < 2 || disabled) {
      requestIdRef.current += 1;
      clearSuggestions();
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setPending(true);

    debounceRef.current = window.setTimeout(() => {
      void autocompleteAddressAction({
        input: trimmed,
        languageCode,
      }).then((result) => {
        if (requestIdRef.current !== requestId) return;
        setPending(false);
        if (!result.ok) {
          setSuggestions([]);
          setError(result.error);
          setOpen(false);
          return;
        }
        setError(null);
        setSuggestions(result.suggestions);
        setOpen(result.suggestions.length > 0);
        setHighlightIndex(-1);
      });
    }, DEBOUNCE_MS);
  }

  function selectSuggestion(suggestion: PlaceAutocompleteSuggestion): void {
    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
    }
    requestIdRef.current += 1;
    onValueChange(suggestion.fullText);
    clearSuggestions();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (!open || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightIndex((current) =>
        current < suggestions.length - 1 ? current + 1 : 0,
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightIndex((current) =>
        current > 0 ? current - 1 : suggestions.length - 1,
      );
      return;
    }
    if (event.key === "Enter" && highlightIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[highlightIndex];
      if (selected) {
        selectSuggestion(selected);
      }
      return;
    }
    if (event.key === "Escape") {
      setOpen(false);
      setHighlightIndex(-1);
    }
  }

  const showMenu = open && suggestions.length > 0 && position != null;

  return (
    <div ref={rootRef} className="relative w-full">
      <input
        ref={inputRef}
        name={name}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          onValueChange(next);
          scheduleFetch(next);
        }}
        onFocus={() => {
          if (suggestions.length > 0) {
            syncPosition();
            setOpen(true);
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={className}
        autoComplete={autoComplete}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
      />

      {pending ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          …
        </span>
      ) : null}

      {mounted && showMenu
        ? createPortal(
            <ul
              ref={menuRef}
              id={listId}
              role="listbox"
              className="fixed z-[300] max-h-60 overflow-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-xl"
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
              }}
            >
              {suggestions.map((suggestion, index) => {
                const active = index === highlightIndex;
                return (
                  <li
                    key={suggestion.placeId}
                    role="option"
                    aria-selected={active}
                  >
                    <button
                      type="button"
                      className={`flex w-full flex-col items-start px-4 py-2.5 text-left text-sm ${
                        active ? "bg-gray-100" : "hover:bg-gray-50"
                      }`}
                      onMouseEnter={() => setHighlightIndex(index)}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <span className="font-medium text-gray-900">
                        {suggestion.primaryText}
                      </span>
                      {suggestion.secondaryText ? (
                        <span className="text-xs text-gray-500">
                          {suggestion.secondaryText}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>,
            document.body,
          )
        : null}

      {error ? <p className="mt-1 text-xs text-amber-700">{error}</p> : null}
    </div>
  );
}
