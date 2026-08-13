"use client";

import { useState } from "react";

import {
  SITE_HEADER_GROUP_ORDER,
  SITE_HEADER_GROUP_ORDER_ON_LIGHT,
} from "@/components/layout/site-header-classes";
import { CreateGroupOrderModal } from "@/features/group-orders/ui/CreateGroupOrderModal";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type GroupOrderHeaderButtonProps = {
  locale: Locale;
  label: string;
  labels: Dictionary["groupOrder"];
  tone?: "onDark" | "onLight";
  className?: string;
  defaultName?: string;
  onClick?: () => void;
};

/**
 * Storefront group-order CTA. Opens the create-group-order modal.
 */
export function GroupOrderHeaderButton({
  locale,
  label,
  labels,
  tone = "onDark",
  className = "",
  defaultName,
  onClick,
}: GroupOrderHeaderButtonProps) {
  const [open, setOpen] = useState(false);
  const toneClass =
    tone === "onLight"
      ? SITE_HEADER_GROUP_ORDER_ON_LIGHT
      : SITE_HEADER_GROUP_ORDER;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          onClick?.();
          setOpen(true);
        }}
        className={`${toneClass} ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {label}
      </button>
      <CreateGroupOrderModal
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
        labels={labels}
        defaultName={defaultName}
      />
    </>
  );
}
