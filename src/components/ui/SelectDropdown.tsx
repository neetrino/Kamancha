"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export const DROPDOWN_ANIMATION_MS = 360;

export type SelectDropdownOption = {
  label: string;
  value: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

type SelectDropdownProps = {
  name?: string;
  ariaLabel: string;
  value: string;
  allLabel?: string;
  options: ReadonlyArray<SelectDropdownOption>;
  className?: string;
  disabled?: boolean;
  onValueChange: (value: string) => void;
  deferChange?: boolean;
  /** Grow the trigger to the selected label instead of truncating. */
  fitContent?: boolean;
};

function measureMenuPosition(trigger: HTMLElement): MenuPosition {
  const rect = trigger.getBoundingClientRect();
  return {
    top: rect.bottom + 8,
    left: rect.left,
    width: rect.width,
  };
}

export function SelectDropdown({
  name,
  ariaLabel,
  value,
  allLabel,
  options,
  className = "",
  disabled = false,
  onValueChange,
  deferChange = true,
  fitContent = false,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const pendingChangeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();

  const selectedLabel =
    options.find((option) => option.value === value)?.label ??
    allLabel ??
    value;

  const wantOpenRef = useRef(false);

  const closeMenu = useCallback(() => {
    wantOpenRef.current = false;
    setOpen(false);
  }, []);

  function openMenu(): void {
    const trigger = rootRef.current;
    if (trigger) setPosition(measureMenuPosition(trigger));
    wantOpenRef.current = true;
    setMounted(true);
  }

  useEffect(() => {
    return () => {
      if (pendingChangeRef.current) {
        clearTimeout(pendingChangeRef.current);
      }
    };
  }, []);

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
      if (event.key === "Escape") closeMenu();
    }

    function handleReposition(): void {
      const trigger = rootRef.current;
      if (trigger) setPosition(measureMenuPosition(trigger));
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, closeMenu]);

  function selectValue(next: string): void {
    closeMenu();
    if (!deferChange) {
      onValueChange(next);
      return;
    }
    if (pendingChangeRef.current) {
      clearTimeout(pendingChangeRef.current);
    }
    pendingChangeRef.current = setTimeout(() => {
      pendingChangeRef.current = null;
      onValueChange(next);
    }, DROPDOWN_ANIMATION_MS);
  }

  return (
    <div
      ref={rootRef}
      className={`relative ${fitContent ? "w-max" : ""} ${className}`}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        disabled={disabled}
        className={`flex h-11 items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 pr-3 text-left text-sm text-gray-900 shadow-sm outline-none transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50 ${fitContent ? "w-auto" : "w-full"}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? closeMenu() : openMenu())}
      >
        <span className={fitContent ? "whitespace-nowrap" : "min-w-0 truncate"}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {mounted && position
        ? createPortal(
            <SelectDropdownMenu
              menuRef={menuRef}
              listId={listId}
              ariaLabel={ariaLabel}
              open={open}
              position={position}
              value={value}
              allLabel={allLabel}
              options={options}
              onSelect={selectValue}
            />,
            document.body,
          )
        : null}
    </div>
  );
}

type SelectDropdownMenuProps = {
  menuRef: RefObject<HTMLDivElement | null>;
  listId: string;
  ariaLabel: string;
  open: boolean;
  position: MenuPosition;
  value: string;
  allLabel?: string;
  options: ReadonlyArray<SelectDropdownOption>;
  onSelect: (value: string) => void;
};

function SelectDropdownMenu({
  menuRef,
  listId,
  ariaLabel,
  open,
  position,
  value,
  allLabel,
  options,
  onSelect,
}: SelectDropdownMenuProps) {
  return (
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
        minWidth: position.width,
        width: "max-content",
        transitionDuration: `${DROPDOWN_ANIMATION_MS}ms`,
      }}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="max-h-72 overflow-y-auto rounded-2xl border border-gray-100 bg-white py-2 shadow-lg"
        >
          {allLabel !== undefined ? (
            <SelectDropdownOptionRow
              label={allLabel}
              selected={value === ""}
              onSelect={() => onSelect("")}
            />
          ) : null}
          {options.map((option) => (
            <SelectDropdownOptionRow
              key={option.value}
              label={option.label}
              selected={value === option.value}
              onSelect={() => onSelect(option.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

type SelectDropdownOptionRowProps = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

export function SelectDropdownOptionRow({
  label,
  selected,
  onSelect,
}: SelectDropdownOptionRowProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-50"
      onClick={onSelect}
    >
      <span
        className={
          selected
            ? "flex h-4 w-4 shrink-0 items-center justify-center rounded border border-gray-900 bg-gray-900 text-white"
            : "flex h-4 w-4 shrink-0 rounded border border-gray-300 bg-white"
        }
        aria-hidden
      >
        {selected ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
            <path
              d="M2.5 6.2 4.8 8.5 9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
