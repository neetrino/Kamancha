"use client";

import { Search } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
} from "react";
import { useSearchParams } from "next/navigation";

import { useAdminFilterNavigate } from "@/features/admin/ui/admin-filter-navigation";
import {
  ADMIN_SEARCH_FIELD,
  ADMIN_SEARCH_WRAP,
} from "@/features/admin/ui/admin-form-classes";

const DEFAULT_AUTO_SUBMIT_DEBOUNCE_MS = 300;

type AdminSearchInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> & {
  /**
   * Debounced soft navigation of the parent filter form while typing.
   * Defaults to on for uncontrolled fields (URL filters); off when `value`
   * is controlled (client-side filtering already updates live).
   */
  autoSubmit?: boolean;
  /** Delay before updating the URL. Clearing the field applies immediately. */
  debounceMs?: number;
};

/** Admin search field with a leading magnifying-glass icon. */
export function AdminSearchInput({
  className = "",
  autoSubmit,
  debounceMs = DEFAULT_AUTO_SUBMIT_DEBOUNCE_MS,
  onChange,
  value,
  defaultValue,
  name = "q",
  onKeyDown,
  ...props
}: AdminSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const focusedRef = useRef(false);
  const navigateFilters = useAdminFilterNavigate();
  const searchParams = useSearchParams();
  const isControlled = value !== undefined;
  const shouldAutoNavigate = autoSubmit ?? !isControlled;
  const urlValue = searchParams.get(name) ?? "";
  const [localValue, setLocalValue] = useState(() => {
    if (isControlled) return String(value ?? "");
    if (defaultValue != null) return String(defaultValue);
    return urlValue;
  });

  useEffect(() => {
    if (isControlled) return;
    // Don't clobber in-progress typing when a soft navigation lands.
    if (focusedRef.current) return;
    setLocalValue(urlValue);
  }, [isControlled, urlValue]);

  useEffect(() => {
    if (!shouldAutoNavigate || isControlled) return;
    if (localValue === urlValue) return;

    const trimmed = localValue.trim();
    const delay = trimmed.length === 0 ? 0 : debounceMs;
    const timer = window.setTimeout(() => {
      navigateFilters(inputRef.current?.form ?? null, {
        [name]: trimmed.length === 0 ? null : localValue,
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [
    debounceMs,
    isControlled,
    localValue,
    name,
    navigateFilters,
    shouldAutoNavigate,
    urlValue,
  ]);

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onChange?.(event);
    if (!isControlled) {
      setLocalValue(event.target.value);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    onKeyDown?.(event);
    if (event.defaultPrevented || !shouldAutoNavigate || isControlled) return;
    if (event.key !== "Enter") return;
    event.preventDefault();
    const trimmed = localValue.trim();
    navigateFilters(inputRef.current?.form ?? null, {
      [name]: trimmed.length === 0 ? null : localValue,
    });
  }

  return (
    <div className={`${ADMIN_SEARCH_WRAP} ${className}`.trim()}>
      <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        name={name}
        className={ADMIN_SEARCH_FIELD}
        {...props}
        {...(isControlled ? { value } : { value: localValue })}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          focusedRef.current = true;
          props.onFocus?.(event);
        }}
        onBlur={(event) => {
          focusedRef.current = false;
          props.onBlur?.(event);
          if (!shouldAutoNavigate || isControlled) return;
          if (localValue === urlValue) return;
          const trimmed = localValue.trim();
          navigateFilters(inputRef.current?.form ?? null, {
            [name]: trimmed.length === 0 ? null : localValue,
          });
        }}
      />
    </div>
  );
}
