"use client";

import { useEffect } from "react";

/** Mark overlay content that may still scroll while the document is locked. */
export const BODY_SCROLL_LOCK_ALLOW = "data-body-scroll-lock-allow";

type SavedScrollLockStyles = {
  htmlOverflow: string;
  bodyOverflow: string;
  htmlOverscrollBehavior: string;
  bodyOverscrollBehavior: string;
};

let lockCount = 0;
let savedStyles: SavedScrollLockStyles | null = null;

function isTouchMoveAllowed(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return target.closest(`[${BODY_SCROLL_LOCK_ALLOW}]`) !== null;
}

function handleTouchMove(event: TouchEvent): void {
  if (isTouchMoveAllowed(event.target)) return;
  event.preventDefault();
}

function handleWheel(event: WheelEvent): void {
  if (isTouchMoveAllowed(event.target)) return;
  event.preventDefault();
}

function acquireBodyScrollLock(): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  if (lockCount === 0) {
    const html = document.documentElement;
    const body = document.body;
    savedStyles = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overscrollBehavior = "none";
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("wheel", handleWheel, {
      passive: false,
      capture: true,
    });
  }

  lockCount += 1;

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount > 0 || savedStyles === null) return;

    const html = document.documentElement;
    const body = document.body;
    html.style.overflow = savedStyles.htmlOverflow;
    body.style.overflow = savedStyles.bodyOverflow;
    html.style.overscrollBehavior = savedStyles.htmlOverscrollBehavior;
    body.style.overscrollBehavior = savedStyles.bodyOverscrollBehavior;
    savedStyles = null;
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("wheel", handleWheel, true);
  };
}

/**
 * Prevents document / background scroll while `locked` is true.
 * Nested overlays share a ref-count so unlocking one does not free the page early.
 * Put {@link BODY_SCROLL_LOCK_ALLOW} on scrollable overlay surfaces.
 */
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    return acquireBodyScrollLock();
  }, [locked]);
}
