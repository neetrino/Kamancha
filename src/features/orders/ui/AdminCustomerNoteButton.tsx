"use client";

import { Bell, X } from "lucide-react";
import {
  useEffect,
  useId,
  useState,
  type AnimationEvent,
} from "react";
import { createPortal } from "react-dom";

import { useIsClient } from "@/lib/react/use-is-client";
import {
  BODY_SCROLL_LOCK_ALLOW,
  useBodyScrollLock,
} from "@/lib/react/use-body-scroll-lock";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";

const DIALOG_EXIT_MS = 320;

type AdminCustomerNoteButtonProps = {
  note: string;
  customerName: string;
  title: string;
  closeLabel: string;
  openAriaLabel: string;
};

/**
 * Call-icon control that reveals the linked customer's operator note.
 * Render only when a non-empty note exists.
 */
export function AdminCustomerNoteButton({
  note,
  customerName,
  title,
  closeLabel,
  openAriaLabel,
}: AdminCustomerNoteButtonProps) {
  const titleId = useId();
  const descriptionId = useId();
  const mounted = useIsClient();
  const [open, setOpen] = useState(false);
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
    if (!rendered) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered]);

  function finishExit(): void {
    setRendered(false);
    setExiting(false);
  }

  function handlePanelAnimationEnd(
    event: AnimationEvent<HTMLDivElement>,
  ): void {
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

  return (
    <>
      <button
        type="button"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-500 transition-colors hover:bg-orange-200"
        aria-label={openAriaLabel}
        title={openAriaLabel}
        onClick={(event) => {
          event.stopPropagation();
          setOpen(true);
        }}
      >
        <Bell className="h-4 w-4" aria-hidden />
      </button>

      {mounted && rendered
        ? createPortal(
            <div
              className="fixed inset-0 z-[300] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={`absolute inset-0 cursor-pointer bg-black/40 ${backdropClass}`}
                aria-label={closeLabel}
                onClick={() => setOpen(false)}
              />
              <div
                className={`relative z-[1] w-full max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-7 ${panelClass}`}
                {...{ [BODY_SCROLL_LOCK_ALLOW]: "" }}
                onAnimationEnd={handlePanelAnimationEnd}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2
                      id={titleId}
                      className="text-xl font-semibold text-gray-900"
                    >
                      {title}
                    </h2>
                    <p className="mt-3 text-lg font-semibold text-brand-forest">
                      {customerName}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
                    aria-label={closeLabel}
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <p
                  id={descriptionId}
                  className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-gray-700"
                >
                  {note}
                </p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
