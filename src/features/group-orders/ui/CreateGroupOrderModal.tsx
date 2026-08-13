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

const MODAL_EXIT_MS = 320;

const FIELD_CLASS =
  "h-11 w-full rounded-2xl border border-white/50 bg-white/55 px-4 text-sm text-gray-900 shadow-sm outline-none backdrop-blur-sm transition-colors placeholder:text-black/40 hover:border-white/70 focus:border-white/80";

type CreateGroupOrderModalProps = {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  labels: Dictionary["groupOrder"];
  defaultName?: string;
};

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
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [rendered, exiting, onClose]);

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
    <div className="fixed inset-0 z-[220] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className={`absolute inset-0 bg-black/30 backdrop-blur-md ${backdropClass}`}
        aria-label={labels.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.createTitle}
        className={`liquid-glass isolate relative z-[1] flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl ${panelClass}`}
        onAnimationEnd={handlePanelAnimationEnd}
      >
        <div className="relative z-[2] flex min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3 border-b border-white/35 px-5 py-4">
            <div>
              <h2 className="font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
                {labels.createTitle}
              </h2>
              <p className="mt-1 text-sm text-black/55">
                {labels.createDescription}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/40 text-gray-800 transition hover:bg-white/60"
              aria-label={labels.close}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-800">
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
                  <p className="mb-1.5 text-xs text-black/55">
                    {labels.spendLimitHint}
                  </p>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/50 bg-white/55 px-3 py-2 backdrop-blur-sm">
                    <span className="text-sm text-black/50">֏</span>
                    <input
                      inputMode="numeric"
                      value={spendLimit}
                      onChange={(event) => setSpendLimit(event.target.value)}
                      placeholder={labels.spendLimitLabel}
                      className="w-full bg-transparent text-sm text-gray-900 outline-none"
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

            <p className="flex items-start gap-2 text-xs leading-relaxed text-black/55">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {labels.infoNote}
            </p>

            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="border-t border-white/35 px-5 py-4">
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
      className={`liquid-glass isolate w-full overflow-hidden rounded-2xl p-4 text-left transition-all ${
        selected ? "ring-2 ring-inset ring-brand-forest" : "hover:brightness-[1.04]"
      }`}
    >
      <div className="relative z-[2] flex items-start gap-3">
        <Users className="mt-0.5 h-5 w-5 shrink-0 text-gray-800" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {hint ? (
            <p className="mt-0.5 text-xs text-black/55">{hint}</p>
          ) : null}
          {children}
        </div>
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-brand-forest" : "border-black/25"
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
