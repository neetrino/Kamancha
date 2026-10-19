"use client";

import { useEffect, useState, type AnimationEvent } from "react";
import { createPortal } from "react-dom";

import {
  saryanBarMenuUrl,
  saryanMenuUrl,
  saryanWineMenuUrl,
} from "@/lib/brand/store-menus";
import type { Locale } from "@/lib/i18n/config";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";
import {
  BODY_SCROLL_LOCK_ALLOW,
  useBodyScrollLock,
} from "@/lib/react/use-body-scroll-lock";
import { useIsClient } from "@/lib/react/use-is-client";

const DIALOG_EXIT_MS = 320;

type SaryanMenuDialogProps = {
  open: boolean;
  locale: Locale;
  title: string;
  foodLabel: string;
  barLabel: string;
  wineLabel: string;
  closeLabel: string;
  onClose: () => void;
};

const menuLinkClass =
  "flex h-12 w-full items-center justify-center rounded-[70px] bg-white px-6 font-big-fat-boii text-base leading-none text-brand-forest uppercase transition-opacity hover:opacity-90";

/**
 * Picker for Saryan food, bar, and wine PDFs.
 */
export function SaryanMenuDialog({
  open,
  locale,
  title,
  foodLabel,
  barLabel,
  wineLabel,
  closeLabel,
  onClose,
}: SaryanMenuDialogProps) {
  const mounted = useIsClient();
  const [rendered, setRendered] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (open) {
      scheduleStateUpdate(setExiting, false);
      scheduleStateUpdate(setRendered, true);
      return;
    }

    if (!rendered) return;

    scheduleStateUpdate(setExiting, true);
    const timer = window.setTimeout(() => {
      setRendered(false);
      setExiting(false);
    }, DIALOG_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open, rendered]);

  useBodyScrollLock(rendered);

  useEffect(() => {
    if (!rendered || exiting) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered, exiting, onClose]);

  function finishExit(): void {
    setRendered(false);
    setExiting(false);
  }

  function handlePanelAnimationEnd(event: AnimationEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) return;
    if (!event.animationName.includes("confirm-dialog-panel-out")) return;
    finishExit();
  }

  if (!mounted || !rendered) return null;

  const backdropClass = exiting
    ? "animate-confirm-dialog-backdrop-out"
    : "animate-confirm-dialog-backdrop-in";
  const panelClass = exiting
    ? "animate-confirm-dialog-panel-out"
    : "animate-confirm-dialog-panel-in";

  const options = [
    { href: saryanMenuUrl(locale), label: foodLabel },
    { href: saryanBarMenuUrl(), label: barLabel },
    { href: saryanWineMenuUrl(), label: wineLabel },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saryan-menu-dialog-title"
    >
      <button
        type="button"
        className={`absolute inset-0 cursor-pointer bg-black/60 ${backdropClass}`}
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        className={`relative z-[1] w-full max-w-[360px] rounded-[30px] border-2 border-white bg-brand-forest p-7 shadow-2xl ${panelClass}`}
        {...{ [BODY_SCROLL_LOCK_ALLOW]: "" }}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <h2
          id="saryan-menu-dialog-title"
          className="font-big-fat-boii mb-6 text-center text-[22px] leading-7 font-normal text-white uppercase"
        >
          {title}
        </h2>
        <div className="flex flex-col gap-3">
          {options.map((option) => (
            <a
              key={option.href}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className={menuLinkClass}
            >
              {option.label}
            </a>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
