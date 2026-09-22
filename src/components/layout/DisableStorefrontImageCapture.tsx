"use client";

import { useEffect } from "react";

function isStorefrontImage(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest("img, picture"));
}

/**
 * Soft UX guard: block drag-out and right-click/save on storefront images
 * (including lightbox portals mounted on document.body).
 */
export function DisableStorefrontImageCapture(): null {
  useEffect(() => {
    function onDragStart(event: DragEvent): void {
      if (!isStorefrontImage(event.target)) return;
      event.preventDefault();
    }

    function onContextMenu(event: MouseEvent): void {
      if (!isStorefrontImage(event.target)) return;
      event.preventDefault();
    }

    document.addEventListener("dragstart", onDragStart, { capture: true });
    document.addEventListener("contextmenu", onContextMenu, { capture: true });

    return () => {
      document.removeEventListener("dragstart", onDragStart, { capture: true });
      document.removeEventListener("contextmenu", onContextMenu, {
        capture: true,
      });
    };
  }, []);

  return null;
}
