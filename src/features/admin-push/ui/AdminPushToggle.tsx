"use client";

import { Bell, BellOff, BellRing, LoaderCircle, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  useAdminPushToggle,
  type AdminPushToggleState,
} from "@/features/admin-push/ui/use-admin-push-toggle";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type PushCopy = Dictionary["admin"]["orders"]["push"];

type AdminPushToggleProps = {
  locale: Locale;
  publicKey: string | null;
  copy: PushCopy;
};

const BASE_CLASS =
  "inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm transition disabled:cursor-wait disabled:opacity-70";
const ON_CLASS = "bg-brand-forest text-white hover:bg-brand-forest/90";
const OFF_CLASS =
  "border border-brand-forest bg-white text-brand-forest hover:bg-brand-forest/5";

type StateView = { icon: LucideIcon; label: keyof PushCopy };

const STATE_VIEWS: Record<AdminPushToggleState, StateView> = {
  loading: { icon: LoaderCircle, label: "loading" },
  off: { icon: BellRing, label: "enable" },
  on: { icon: Bell, label: "enabled" },
  blocked: { icon: BellOff, label: "blocked" },
  error: { icon: TriangleAlert, label: "error" },
};

/** Orders header pill: enable / disable Web Push new-order alerts. */
export function AdminPushToggle({
  locale,
  publicKey,
  copy,
}: AdminPushToggleProps) {
  const { supported, state, toggle } = useAdminPushToggle(locale, publicKey);
  if (!supported) return null;

  const view = STATE_VIEWS[state];
  const Icon = view.icon;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={state === "loading"}
      aria-pressed={state === "on"}
      title={state === "blocked" ? copy.blockedHint : undefined}
      className={`${BASE_CLASS} ${state === "on" ? ON_CLASS : OFF_CLASS}`}
    >
      <Icon
        className={`size-4 shrink-0 ${state === "loading" ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      {copy[view.label]}
    </button>
  );
}
