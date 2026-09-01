"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";

const INPUT_CLASS =
  "h-9 min-w-0 flex-1 rounded-[15px] border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 xl:rounded-lg";

const USE_MAX_CLASS =
  "h-9 shrink-0 rounded-[15px] border-gray-200 bg-white px-3 text-sm text-gray-900 hover:bg-gray-50 xl:rounded-lg";

export type CheckoutBonusRedeemState = {
  availableBalance: number;
  maxRedeem: number;
  useBonuses: boolean;
  redeemAmount: number;
  onToggle: (enabled: boolean) => void;
  onAmountChange: (amount: number) => void;
  onUseMax: () => void;
  labels: {
    title: string;
    available: string;
    useBonuses: string;
    amount: string;
    useMax: string;
  };
  formatMoney: (amount: number) => string;
};

type CheckoutBonusRedeemFieldProps = {
  bonus: CheckoutBonusRedeemState;
  isSubmitting: boolean;
};

function clampBonusAmount(raw: string, maxAllowed: number): number {
  if (raw === "") {
    return 0;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.min(parsed, maxAllowed);
}

export function CheckoutBonusRedeemField({
  bonus,
  isSubmitting,
}: CheckoutBonusRedeemFieldProps) {
  const availableText = bonus.labels.available.replace(
    "{amount}",
    bonus.formatMoney(bonus.availableBalance),
  );
  const canRedeem = bonus.maxRedeem > 0;
  const maxAllowed = Math.min(bonus.maxRedeem, bonus.availableBalance);
  const [draft, setDraft] = useState(
    bonus.redeemAmount > 0 ? String(bonus.redeemAmount) : "",
  );

  useEffect(() => {
    if (!bonus.useBonuses) {
      setDraft("");
      return;
    }
    setDraft(bonus.redeemAmount > 0 ? String(bonus.redeemAmount) : "");
  }, [bonus.useBonuses, bonus.redeemAmount]);

  return (
    <div className="relative z-[2] space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="flex min-w-0 items-center gap-2 text-sm text-white">
          <input
            type="checkbox"
            checked={bonus.useBonuses}
            onChange={(event) => bonus.onToggle(event.target.checked)}
            disabled={isSubmitting || !canRedeem}
            style={{ accentColor: "#f3e5a8" }}
            className="h-4 w-4 shrink-0 rounded border-white/50 bg-white/10 focus:ring-[#f3e5a8]/40 disabled:opacity-50"
            aria-label={bonus.labels.useBonuses}
          />
          <span className="truncate font-semibold">{bonus.labels.title}</span>
        </label>
        <p className="shrink-0 text-sm text-white/70">{availableText}</p>
      </div>
      {bonus.useBonuses ? (
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={draft}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, "");
              if (digits === "") {
                setDraft("");
                bonus.onAmountChange(0);
                return;
              }
              const next = clampBonusAmount(digits, maxAllowed);
              setDraft(String(next));
              bonus.onAmountChange(next);
            }}
            disabled={isSubmitting}
            aria-label={bonus.labels.amount}
            placeholder={bonus.labels.amount}
            className={INPUT_CLASS}
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            className={USE_MAX_CLASS}
            disabled={isSubmitting || !canRedeem}
            onClick={() => {
              bonus.onUseMax();
              setDraft(String(maxAllowed));
            }}
          >
            {bonus.labels.useMax}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
