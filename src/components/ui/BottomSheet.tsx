"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
  type ReactNode,
  type TransitionEvent,
} from "react";
import { createPortal } from "react-dom";

import {
  BOTTOM_SHEET_SCROLL_ATTR,
  useBottomSheetDrag,
} from "@/components/ui/use-bottom-sheet-drag";
import { scheduleStateUpdate } from "@/lib/react/schedule-after-paint";
import { useIsClient } from "@/lib/react/use-is-client";
import {
  BODY_SCROLL_LOCK_ALLOW,
  useBodyScrollLock,
} from "@/lib/react/use-body-scroll-lock";

/** Must match `.animate-bottom-sheet-*` duration in globals.css. */
export const BOTTOM_SHEET_ANIMATION_MS = 300;
const SHEET_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

type MotionPhase = "enter" | "idle" | "exit" | "exit-drag";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  zIndexClassName?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
  closeLabel?: string;
};

/**
 * Viewport-wide panel that slides up from the bottom (mobile checkout, etc.).
 * Dismiss with the top handle, swipe down, backdrop, or Escape.
 */
export function BottomSheet({
  open,
  onClose,
  ariaLabel,
  children,
  zIndexClassName = "z-[210]",
  panelClassName = "",
  panelStyle,
  closeLabel = "Close",
}: BottomSheetProps) {
  const mounted = useIsClient();
  const [rendered, setRendered] = useState(false);
  const [phase, setPhase] = useState<MotionPhase>("enter");
  const [isDragging, setIsDragging] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [displayAriaLabel, setDisplayAriaLabel] = useState(ariaLabel);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const exitDoneRef = useRef(false);
  const childrenRef = useRef(children);
  const ariaLabelRef = useRef(ariaLabel);
  const onCloseRef = useRef(onClose);
  const renderedRef = useRef(false);
  const phaseRef = useRef<MotionPhase>("enter");

  useLayoutEffect(() => {
    childrenRef.current = children;
    ariaLabelRef.current = ariaLabel;
    onCloseRef.current = onClose;
    renderedRef.current = rendered;
    phaseRef.current = phase;
  });

  useLayoutEffect(() => {
    if (!rendered) {
      scrollAreaRef.current = null;
      return;
    }
    scrollAreaRef.current =
      panelRef.current?.querySelector<HTMLDivElement>(
        `[${BOTTOM_SHEET_SCROLL_ATTR}]`,
      ) ?? null;
  });

  const finishExit = useCallback((): void => {
    if (exitDoneRef.current) return;
    exitDoneRef.current = true;
    setRendered(false);
    setPhase("enter");
    setIsDragging(false);
    const panel = panelRef.current;
    if (panel) {
      panel.style.transition = "";
      panel.style.transform = "";
    }
  }, []);

  const handleDismissFromDrag = useCallback((releaseOffsetY: number) => {
    setIsDragging(false);
    setPhase("exit-drag");
    const panel = panelRef.current;
    if (panel) {
      panel.style.transition = "none";
      panel.style.transform = `translateY(${releaseOffsetY}px)`;
      void panel.getBoundingClientRect();
      panel.style.transition = `transform ${BOTTOM_SHEET_ANIMATION_MS}ms ${SHEET_EASING}`;
      panel.style.transform = "translateY(100%)";
    }
    onCloseRef.current();
  }, []);

  const dragEnabled = rendered && open && phase === "idle";
  const {
    headerPointerHandlers,
    scrollAreaPointerHandlers,
    panelPointerHandlers,
  } = useBottomSheetDrag({
    enabled: dragEnabled,
    panelRef,
    scrollAreaRef,
    onDismiss: handleDismissFromDrag,
    onSnapBack: () => {
      setIsDragging(false);
    },
    onOffsetChange: (offsetY) => {
      setIsDragging(offsetY > 0);
    },
  });

  useEffect(() => {
    if (!open) return;
    scheduleStateUpdate(setDisplayChildren, children);
    scheduleStateUpdate(setDisplayAriaLabel, ariaLabel);
  }, [open, children, ariaLabel]);

  useEffect(() => {
    if (open) {
      exitDoneRef.current = false;
      scheduleStateUpdate(setIsDragging, false);
      scheduleStateUpdate(setPhase, "enter");
      scheduleStateUpdate(setRendered, true);
      const panel = panelRef.current;
      if (panel) {
        panel.style.transition = "";
        panel.style.transform = "";
      }
      return;
    }

    if (!renderedRef.current) return;

    if (phaseRef.current === "exit-drag") {
      const timer = window.setTimeout(() => {
        finishExit();
      }, BOTTOM_SHEET_ANIMATION_MS);
      return () => window.clearTimeout(timer);
    }

    scheduleStateUpdate(setPhase, "exit");
    const timer = window.setTimeout(() => {
      finishExit();
    }, BOTTOM_SHEET_ANIMATION_MS);

    return () => window.clearTimeout(timer);
  }, [open, finishExit]);

  useBodyScrollLock(rendered);

  useEffect(() => {
    if (!rendered) return;

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") onCloseRef.current();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered]);

  function handlePanelAnimationEnd(
    event: AnimationEvent<HTMLDivElement>,
  ): void {
    if (event.target !== event.currentTarget) return;
    if (event.animationName.includes("bottom-sheet-panel-in")) {
      setPhase("idle");
      return;
    }
    if (event.animationName.includes("bottom-sheet-panel-out")) {
      finishExit();
    }
  }

  function handlePanelTransitionEnd(
    event: TransitionEvent<HTMLDivElement>,
  ): void {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "transform") return;
    if (phase !== "exit-drag") return;
    finishExit();
  }

  if (!mounted || !rendered) return null;

  const backdropClass =
    phase === "enter"
      ? "animate-bottom-sheet-backdrop-in"
      : phase === "exit" || phase === "exit-drag"
        ? "animate-bottom-sheet-backdrop-out"
        : "bottom-sheet-backdrop-idle";
  const panelMotionClass =
    phase === "enter"
      ? "animate-bottom-sheet-panel-in"
      : phase === "exit"
        ? "animate-bottom-sheet-panel-out"
        : "";
  const panelChildren = open && phase !== "exit" && phase !== "exit-drag"
    ? children
    : displayChildren;
  const panelAriaLabel = open && phase !== "exit" && phase !== "exit-drag"
    ? ariaLabel
    : displayAriaLabel;

  return createPortal(
    <div
      className={`fixed inset-0 flex items-end overscroll-none xl:hidden ${zIndexClassName}`}
      role="dialog"
      aria-modal="true"
      aria-label={panelAriaLabel}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 ${backdropClass}`}
        aria-label={closeLabel}
        onClick={() => onCloseRef.current()}
      />
      <div
        ref={panelRef}
        className={`relative z-[1] flex h-[min(93dvh,100dvh)] w-full flex-col overflow-hidden rounded-t-[28px] shadow-[0_-12px_40px_rgba(0,0,0,0.18)] ${panelMotionClass} ${panelClassName}`}
        style={panelStyle}
        onAnimationEnd={handlePanelAnimationEnd}
        onTransitionEnd={handlePanelTransitionEnd}
        {...panelPointerHandlers}
      >
        <div
          className="relative z-20 flex h-11 shrink-0 cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing"
          {...headerPointerHandlers}
        >
          <div
            className="h-1.5 w-16 rounded-full bg-white"
            aria-hidden
          />
          <span className="sr-only">{closeLabel}</span>
        </div>
        <div
          className={`relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden ${
            isDragging || phase === "exit-drag" ? "touch-none" : ""
          }`}
          {...{ [BODY_SCROLL_LOCK_ALLOW]: "" }}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.closest("button, a, input, textarea, select")) return;
            scrollAreaPointerHandlers.onPointerDown(event);
          }}
        >
          {panelChildren}
        </div>
      </div>
    </div>,
    document.body,
  );
}
