"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

const DISMISS_THRESHOLD_PX = 120;
const SCROLL_DRAG_ARM_PX = 8;
/** Treat near-top as top (subpixel / iOS rubber-band residue). */
const SCROLL_TOP_EPSILON_PX = 1;

export const BOTTOM_SHEET_SCROLL_ATTR = "data-bottom-sheet-scroll";

type DragSession = {
  pointerId: number;
  startClientY: number;
};

type UseBottomSheetDragArgs = {
  enabled: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  onDismiss: (releaseOffsetY: number) => void;
  onSnapBack: () => void;
  /** Live drag offset while the finger is down (px). */
  onOffsetChange: (offsetY: number) => void;
};

type UseBottomSheetDragResult = {
  headerPointerHandlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  };
  scrollAreaPointerHandlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  };
  panelPointerHandlers: {
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  };
};

function isScrollAtTop(scrollArea: HTMLElement | null): boolean {
  return (scrollArea?.scrollTop ?? 0) <= SCROLL_TOP_EPSILON_PX;
}

/**
 * Swipe-down dismiss (social-sheet style): grabber always, and anywhere on
 * content when scrolled to the top. Transform is applied on the panel node
 * so React state cannot fight the finger.
 */
export function useBottomSheetDrag({
  enabled,
  panelRef,
  scrollAreaRef,
  onDismiss,
  onSnapBack,
  onOffsetChange,
}: UseBottomSheetDragArgs): UseBottomSheetDragResult {
  const activeDragRef = useRef<DragSession | null>(null);
  const pendingScrollDragRef = useRef<DragSession | null>(null);
  const onDismissRef = useRef(onDismiss);
  const onSnapBackRef = useRef(onSnapBack);
  const onOffsetChangeRef = useRef(onOffsetChange);

  useLayoutEffect(() => {
    onDismissRef.current = onDismiss;
    onSnapBackRef.current = onSnapBack;
    onOffsetChangeRef.current = onOffsetChange;
  });

  const clearSessions = useCallback((): void => {
    activeDragRef.current = null;
    pendingScrollDragRef.current = null;
  }, []);

  const applyOffset = useCallback(
    (offsetY: number, withTransition: boolean) => {
      const panel = panelRef.current;
      if (!panel) return;
      panel.style.transition = withTransition
        ? "transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)"
        : "none";
      panel.style.transform =
        offsetY > 0 ? `translateY(${offsetY}px)` : "translateY(0)";
      onOffsetChangeRef.current(offsetY);
    },
    [panelRef],
  );

  const beginDrag = useCallback(
    (pointerId: number, startClientY: number) => {
      activeDragRef.current = { pointerId, startClientY };
      pendingScrollDragRef.current = null;
      panelRef.current?.setPointerCapture(pointerId);
    },
    [panelRef],
  );

  const onHeaderPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      beginDrag(event.pointerId, event.clientY);
    },
    [beginDrag, enabled],
  );

  const onScrollAreaPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      if (!isScrollAtTop(scrollAreaRef.current)) return;
      pendingScrollDragRef.current = {
        pointerId: event.pointerId,
        startClientY: event.clientY,
      };
    },
    [enabled, scrollAreaRef],
  );

  const onPanelPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const active = activeDragRef.current;
      if (active && active.pointerId === event.pointerId) {
        const offsetY = Math.max(0, event.clientY - active.startClientY);
        applyOffset(offsetY, false);
        if (offsetY > 0) {
          event.preventDefault();
        }
        return;
      }

      const pending = pendingScrollDragRef.current;
      if (!pending || pending.pointerId !== event.pointerId) return;

      const deltaY = event.clientY - pending.startClientY;
      if (deltaY < -SCROLL_DRAG_ARM_PX) {
        // Finger moved up — let the content scroll normally.
        pendingScrollDragRef.current = null;
        return;
      }
      if (deltaY <= SCROLL_DRAG_ARM_PX) return;
      if (!isScrollAtTop(scrollAreaRef.current)) {
        pendingScrollDragRef.current = null;
        return;
      }

      beginDrag(event.pointerId, pending.startClientY);
      applyOffset(deltaY, false);
      event.preventDefault();
    },
    [applyOffset, beginDrag, scrollAreaRef],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      pendingScrollDragRef.current = null;
      const active = activeDragRef.current;
      if (!active || active.pointerId !== event.pointerId) return;

      if (panelRef.current?.hasPointerCapture(event.pointerId)) {
        panelRef.current.releasePointerCapture(event.pointerId);
      }

      const offsetY = Math.max(0, event.clientY - active.startClientY);
      activeDragRef.current = null;

      if (offsetY >= DISMISS_THRESHOLD_PX) {
        onDismissRef.current(offsetY);
        return;
      }

      applyOffset(0, true);
      onSnapBackRef.current();
    },
    [applyOffset, panelRef],
  );

  useEffect(() => {
    if (!enabled) {
      clearSessions();
    }
  }, [clearSessions, enabled]);

  // Non-passive touchmove so we can block native scroll once pull-to-dismiss arms.
  useEffect(() => {
    if (!enabled) return;
    const panel = panelRef.current;
    if (!panel) return;

    function onTouchMove(event: TouchEvent): void {
      if (activeDragRef.current) {
        event.preventDefault();
        return;
      }

      const pending = pendingScrollDragRef.current;
      if (!pending || event.touches.length === 0) return;

      const touch = event.touches[0];
      if (!touch) return;
      const deltaY = touch.clientY - pending.startClientY;
      if (deltaY > SCROLL_DRAG_ARM_PX && isScrollAtTop(scrollAreaRef.current)) {
        event.preventDefault();
      }
    }

    panel.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      panel.removeEventListener("touchmove", onTouchMove);
    };
  }, [enabled, panelRef, scrollAreaRef]);

  return {
    headerPointerHandlers: { onPointerDown: onHeaderPointerDown },
    scrollAreaPointerHandlers: { onPointerDown: onScrollAreaPointerDown },
    panelPointerHandlers: {
      onPointerMove: onPanelPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
  };
}
