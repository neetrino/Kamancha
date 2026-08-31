"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

import type { StorefrontPopup } from "@/features/popups/application/queries";
import { PromoPopupModal } from "@/features/popups/ui/PromoPopupModal";

const DISMISS_STORAGE_PREFIX = "ws_popup_dismissed:";

type PromoPopupClientProps = {
  popup: StorefrontPopup;
  closeLabel: string;
};

function dismissKey(popupId: string): string {
  return `${DISMISS_STORAGE_PREFIX}${popupId}`;
}

function readDismissed(popupId: string): boolean {
  try {
    return sessionStorage.getItem(dismissKey(popupId)) === "1";
  } catch {
    return false;
  }
}

function markDismissed(popupId: string): void {
  try {
    sessionStorage.setItem(dismissKey(popupId), "1");
  } catch {
    // Ignore quota / private-mode failures; popup may reappear this session.
  }
}

function subscribeDismissed(): () => void {
  return () => {};
}

/** Opens the active promo popup once per browser session. */
export function PromoPopupClient({
  popup,
  closeLabel,
}: PromoPopupClientProps) {
  const wasDismissed = useSyncExternalStore(
    subscribeDismissed,
    () => readDismissed(popup.id),
    () => true,
  );
  const [closedThisView, setClosedThisView] = useState(false);
  const open = !wasDismissed && !closedThisView;

  const handleClose = useCallback(() => {
    markDismissed(popup.id);
    setClosedThisView(true);
  }, [popup.id]);

  return (
    <PromoPopupModal
      open={open}
      title={popup.title}
      imageUrl={popup.imageUrl}
      linkUrl={popup.linkUrl}
      closeLabel={closeLabel}
      onClose={handleClose}
    />
  );
}
