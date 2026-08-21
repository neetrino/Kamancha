"use client";

import { Info, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useTransition,
  type AnimationEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { createGroupOrderAction } from "@/features/group-orders/actions";
import type { GroupOrderPaymentMode } from "@/features/group-orders/domain/status";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

/** Match ConfirmDialog / profile popup exit (globals.css). */
const MODAL_EXIT_MS = 320;

const FIELD_CLASS =
  "h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 shadow-sm outline-none transition-colors placeholder:text-gray-500 hover:border-gray-300 focus:border-brand-forest/40";

const FIELD_LABEL_CLASS = "mb-1.5 block text-sm font-medium text-gray-700";

type CreateGroupOrderModalProps = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  labels: Dictionary["groupOrder"];
  defaultName?: string;
};

/**
 * Create-group-order popup — same centered white dialog language as profile confirms.
 */
export function CreateGroupOrderModal({
  open,
  onClose,
  locale,
  labels,
  defaultName = "",
}: CreateGroupOrderModalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [paymentMode, setPaymentMode] =
    useState<GroupOrderPaymentMode>("ORGANIZER_PAYS_ALL");
  const [name, setName] = useState(defaultName);
  const [spendLimit, setSpendLimit] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setExiting(false);
      setRendered(true);
      setName(defaultName);
      setSpendLimit("");
      setPaymentMode("ORGANIZER_PAYS_ALL");
      setError(null);
      return;
    }
    if (!rendered) return;
    setExiting(true);
    const timer = window.setTimeout(() => {
      setRendered(false);
      setExiting(false);
    }, MODAL_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open, rendered, defaultName]);

  useEffect(() => {
    if (!rendered || exiting) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape" && !pending) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered, exiting, onClose, pending]);

  function finishExit(): void {
    setRendered(false);
    setExiting(false);
  }

  function handlePanelAnimationEnd(event: AnimationEvent<HTMLDivElement>): void {
    if (event.target !== event.currentTarget) return;
    if (!event.animationName.includes("confirm-dialog-panel-out")) return;
    finishExit();
  }

  function submit(): void {
    setError(null);
    const limitRaw = spendLimit.trim();
    const spendLimitAmount =
      paymentMode === "ORGANIZER_PAYS_ALL" && limitRaw
        ? Number.parseInt(limitRaw, 10)
        : null;

    if (
      spendLimitAmount != null &&
      (!Number.isInteger(spendLimitAmount) || spendLimitAmount < 1)
    ) {
      setError(labels.errorGeneric);
      return;
    }

    startTransition(async () => {
      const result = await createGroupOrderAction({
        paymentMode,
        organizerDisplayName: name.trim() || labels.organizer,
        spendLimitAmount,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
      router.push(`/${locale}/group-orders/${result.inviteToken}`);
    });
  }

  if (!mounted || !rendered) return null;

  const backdropClass = exiting
    ? "animate-confirm-dialog-backdrop-out"
    : "animate-confirm-dialog-backdrop-in";
  const panelClass = exiting
    ? "animate-confirm-dialog-panel-out"
    : "animate-confirm-dialog-panel-in";

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <button
        type="button"
        className={`absolute inset-0 cursor-pointer bg-black/40 disabled:cursor-not-allowed ${backdropClass}`}
        aria-label={labels.close}
        disabled={pending}
        onClick={() => {
          if (!pending) onClose();
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.createTitle}
        className={`relative z-[1] flex max-h-[min(92vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-xl sm:max-w-lg ${panelClass}`}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2 className="font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
              {labels.createTitle}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              {labels.createDescription}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={labels.close}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
          <label className="block">
            <span className={FIELD_LABEL_CLASS}>
              {labels.organizerNameLabel}
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={labels.organizerNamePlaceholder}
              className={FIELD_CLASS}
            />
          </label>

          <PaymentOption
            selected={paymentMode === "ORGANIZER_PAYS_ALL"}
            title={labels.paymentModeOrganizer}
            hint={labels.paymentModeOrganizerHint}
            onSelect={() => setPaymentMode("ORGANIZER_PAYS_ALL")}
          >
            {paymentMode === "ORGANIZER_PAYS_ALL" ? (
              <div className="mt-3">
                <p className="mb-1.5 text-xs text-gray-500">
                  {labels.spendLimitHint}
                </p>
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-500">֏</span>
                  <input
                    inputMode="numeric"
                    value={spendLimit}
                    onChange={(event) => setSpendLimit(event.target.value)}
                    placeholder={labels.spendLimitLabel}
                    className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
                  />
                </div>
              </div>
            ) : null}
          </PaymentOption>

          <PaymentOption
            selected={paymentMode === "SPLIT_PER_PARTICIPANT"}
            title={labels.paymentModeSplit}
            onSelect={() => setPaymentMode("SPLIT_PER_PARTICIPANT")}
          />

          <p className="flex items-start gap-2 text-xs leading-relaxed text-gray-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {labels.infoNote}
          </p>

          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-gray-100 px-5 py-4 sm:px-6">
          <KamanchaPillButton
            type="button"
            variant="dark"
            label={labels.start}
            disabled={pending || !name.trim()}
            onClick={submit}
            className="max-w-none sm:max-w-none"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PaymentOption({
  selected,
  title,
  hint,
  onSelect,
  children,
}: {
  selected: boolean;
  title: string;
  hint?: string;
  onSelect: () => void;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[15px] bg-gray-50 p-4 text-left outline-none transition-colors ${
        selected
          ? "ring-2 ring-inset ring-brand-forest"
          : "hover:bg-gray-100"
      }`}
    >
      <div className="flex items-start gap-3">
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-gray-800" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {hint ? (
            <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
          ) : null}
          {children}
        </div>
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-brand-forest" : "border-gray-300"
          }`}
          aria-hidden
        >
          {selected ? (
            <span className="h-2.5 w-2.5 rounded-full bg-brand-forest" />
          ) : null}
        </span>
      </div>
    </button>
  );
}
