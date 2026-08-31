"use client";

import type { KeyboardEvent, ReactNode } from "react";

import { Button } from "@/components/ui/Button";

const INPUT_MOBILE_CLASS =
  "h-11 w-full rounded-[15px] border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-50";

const APPLY_MOBILE_CLASS =
  "h-9 shrink-0 rounded-[15px] border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50";

const INPUT_DESKTOP_CLASS =
  "h-11 min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200";

const APPLY_DESKTOP_CLASS =
  "h-11 shrink-0 rounded-lg border-gray-200 bg-white px-4 text-sm text-gray-900 hover:bg-gray-50";

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
  placeholder,
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
      <div className="relative z-[2] xl:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm text-white">{title}</p>
          <Button
            type="button"
            variant="secondary"
            size="md"
            className={APPLY_MOBILE_CLASS}
            disabled={applyDisabled}
            onClick={onApply}
          >
            {applyText}
          </Button>
        </div>
        <input
          type="text"
          name={name}
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={title}
          autoComplete="off"
          disabled={disabled}
          className={INPUT_MOBILE_CLASS}
        />
      </div>

      <div className="relative z-[2] hidden xl:block">
        <div className="flex gap-2">
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
            className={INPUT_DESKTOP_CLASS}
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            className={APPLY_DESKTOP_CLASS}
            disabled={applyDisabled}
            onClick={onApply}
          >
            {applyText}
          </Button>
        </div>
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
