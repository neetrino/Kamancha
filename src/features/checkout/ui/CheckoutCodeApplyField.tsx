"use client";

import type { KeyboardEvent, ReactNode } from "react";

import { Button } from "@/components/ui/Button";

const INPUT_CLASS =
  "h-9 min-w-0 flex-1 border-0 bg-transparent px-1 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-0 disabled:opacity-60";

const APPLY_CLASS =
  "h-9 shrink-0 rounded-[15px] border-gray-200 bg-white px-4 py-0 text-sm text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 xl:rounded-lg";

const ALERT_PILL_CLASS =
  "relative z-[2] mt-2 mb-0 w-full rounded-full bg-white px-4 py-3 text-center text-sm font-medium leading-snug text-red-600";

type CheckoutCodeApplyFieldProps = {
  title: string;
  name: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onApply: () => void;
  placeholder: string;
  applyLabel: string;
  applyingLabel: string;
  error: string | null;
  isApplying: boolean;
  isSubmitting: boolean;
  children?: ReactNode;
};

export function CheckoutCodeApplyField({
  title,
  name,
  draft,
  onDraftChange,
  onApply,
  applyLabel,
  applyingLabel,
  error,
  isApplying,
  isSubmitting,
  children,
}: CheckoutCodeApplyFieldProps) {
  const disabled = isSubmitting || isApplying;
  const applyDisabled = disabled || !draft.trim();
  const applyText = isApplying ? applyingLabel : applyLabel;

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      onApply();
    }
  }

  return (
    <>
      <div className="relative z-[2] flex gap-2">
        <input
          type="text"
          name={name}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={title}
          aria-label={title}
          autoComplete="off"
          disabled={disabled}
          className={INPUT_CLASS}
        />
        <Button
          type="button"
          variant="secondary"
          size="md"
          className={APPLY_CLASS}
          disabled={applyDisabled}
          onClick={onApply}
        >
          {applyText}
        </Button>
      </div>

      {error ? (
        <p className={ALERT_PILL_CLASS} role="alert">
          {error}
        </p>
      ) : null}
      {children}
    </>
  );
}
