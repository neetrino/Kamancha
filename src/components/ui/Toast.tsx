"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
} from "react";
import { createPortal } from "react-dom";

import { useIsClient } from "@/lib/react/use-is-client";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";

const DEFAULT_TOAST_DURATION_MS = 2500;

/** Must match `.animate-toast-out` max duration in globals.css. */
export const TOAST_ANIMATION_MS = 280;

type ToastTone = "forest" | "warning";

type ToastProps = {
  message: string;
  open: boolean;
  onClose: () => void;
  durationMs?: number;
  /** `warning` — amber banner for validation / attention messages. */
  tone?: ToastTone;
};

const TOAST_TONE_CLASS: Record<ToastTone, string> = {
  forest: "bg-brand-forest text-white",
  /** Warm butter yellow — soft warning, still on-brand with forest text. */
  warning: "border border-[#e2c86a] bg-[#f3e5a8] text-black",
};

/** Brief confirmation toast centered at the top of the viewport. */
export function Toast({
  message,
  open,
  onClose,
  durationMs = DEFAULT_TOAST_DURATION_MS,
  tone = "forest",
}: ToastProps) {
  const mounted = useIsClient();
  const [rendered, setRendered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [displayMessage, setDisplayMessage] = useState(message);
  const exitDoneRef = useRef(false);
  const renderedRef = useRef(false);

  const finishExit = useCallback((): void => {
    if (exitDoneRef.current) {
      return;
    }
    exitDoneRef.current = true;
    renderedRef.current = false;
    setRendered(false);
    setExiting(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      exitDoneRef.current = false;
      scheduleStateUpdate(setExiting, false);
      scheduleStateUpdate(setRendered, true);
      renderedRef.current = true;
      scheduleStateUpdate(setDisplayMessage, message);

      const exitTimer = window.setTimeout(() => {
        setExiting(true);
      }, durationMs);

      return () => window.clearTimeout(exitTimer);
    }

    if (renderedRef.current) {
      scheduleStateUpdate(setExiting, true);
    }
  }, [open, message, durationMs]);

  function handleAnimationEnd(event: AnimationEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (!event.animationName.includes("toast-out")) {
      return;
    }
    finishExit();
  }

  useEffect(() => {
    if (!exiting) {
      return;
    }
    const timer = window.setTimeout(finishExit, TOAST_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [exiting, finishExit]);

  if (!mounted || !rendered || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none fixed top-[max(1.5rem,env(safe-area-inset-top))] left-1/2 z-[300] w-max max-w-[min(90vw,24rem)] -translate-x-1/2">
      <div
        role="status"
        aria-live="polite"
        className={`rounded-xl px-4 py-3 text-center text-sm font-medium shadow-lg ${TOAST_TONE_CLASS[tone]} ${
          exiting ? "animate-toast-out" : "animate-toast-in"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        {displayMessage}
      </div>
    </div>,
    document.body,
  );
}
