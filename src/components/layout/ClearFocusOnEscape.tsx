"use client";

import { useEffect } from "react";

import { clearActiveFocus } from "@/lib/dom/clear-active-focus";

/**
 * After Esc (modals, menus, lightbox), drop lingering blue focus rings site-wide.
 */
export function ClearFocusOnEscape(): null {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      clearActiveFocus();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
