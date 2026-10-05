"use client";

import { X } from "lucide-react";
import { useEffect, useState, type AnimationEvent } from "react";
import { createPortal } from "react-dom";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import {
  BODY_SCROLL_LOCK_ALLOW,
  useBodyScrollLock,
} from "@/lib/react/use-body-scroll-lock";
import { useIsClient } from "@/lib/react/use-is-client";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";

const MODAL_EXIT_MS = 320;

type LeaveGroupOrderDialogProps = {
  open: boolean;
  title: string;
  description: string;
  continueLabel: string;
  confirmLabel: string;
  closeLabel: string;
  isPending?: boolean;
  onContinue: () => void;
  onConfirm: () => void;
};

/**
 * Exit confirmation for an active group order.
 * Continue keeps the session; confirm leaves or cancels it.
 */
export function LeaveGroupOrderDialog({
  open,
  title,
  description,
  continueLabel,
  confirmLabel,
  closeLabel,
  isPending = false,
  onContinue,
  onConfirm,
}: LeaveGroupOrderDialogProps) {
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
    }, MODAL_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open, rendered]);

  useBodyScrollLock(rendered && !exiting);

  useEffect(() => {
    if (!rendered || exiting) return;
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !isPending) onContinue();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [rendered, exiting, onContinue, isPending]);

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

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <button
        type="button"
        className={`absolute inset-0 cursor-pointer bg-black/30 backdrop-blur-md disabled:cursor-not-allowed ${backdropClass}`}
        aria-label={closeLabel}
        disabled={isPending}
        onClick={() => {
          if (!isPending) onContinue();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-group-order-title"
        aria-describedby="leave-group-order-description"
        className={`relative z-[1] w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ${panelClass}`}
        {...{ [BODY_SCROLL_LOCK_ALLOW]: "" }}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
          <h2
            id="leave-group-order-title"
            className="font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase"
          >
            {title}
          </h2>
          <button
            type="button"
            aria-label={closeLabel}
            disabled={isPending}
            onClick={onContinue}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4 sm:px-6">
          <p
            id="leave-group-order-description"
            className="text-sm leading-relaxed text-gray-600"
          >
            {description}
          </p>
          <KamanchaPillButton
            type="button"
            variant="dark"
            label={isPending ? "…" : continueLabel}
            disabled={isPending}
            onClick={onContinue}
            className="max-w-none sm:max-w-none"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white px-5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
