"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type SlidingNavIndicatorBox = {
  top: number;
  height: number;
};

/** Same duration as the profile sidebar pill. */
export const SLIDING_NAV_TRANSITION_MS = 380;

/**
 * Measures the active nav row and exposes a sliding highlight box.
 */
export function useSlidingNavIndicator(activeId: string): {
  navRef: RefObject<HTMLElement | null>;
  indicator: SlidingNavIndicatorBox | null;
  slideEnabled: boolean;
  registerItem: (id: string, node: HTMLElement | null) => void;
} {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [indicator, setIndicator] = useState<SlidingNavIndicatorBox | null>(
    null,
  );
  const [slideEnabled, setSlideEnabled] = useState(false);

  useLayoutEffect(() => {
    const frameId = requestAnimationFrame(() => {
      if (!activeId) {
        setIndicator(null);
        return;
      }
      const item = itemRefs.current.get(activeId);
      if (!item) return;
      setIndicator({ top: item.offsetTop, height: item.offsetHeight });
    });
    return () => cancelAnimationFrame(frameId);
  }, [activeId]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setSlideEnabled(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const item = itemRefs.current.get(activeId);
      if (!item) return;
      setIndicator({ top: item.offsetTop, height: item.offsetHeight });
    });
    observer.observe(nav);
    for (const item of itemRefs.current.values()) {
      observer.observe(item);
    }
    return () => observer.disconnect();
  }, [activeId]);

  function registerItem(id: string, node: HTMLElement | null): void {
    if (node) {
      itemRefs.current.set(id, node);
    } else {
      itemRefs.current.delete(id);
    }
  }

  return { navRef, indicator, slideEnabled, registerItem };
}
