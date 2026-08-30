"use client";

import { Button } from "@/components/ui/Button";

const INPUT_CLASS =
  "h-11 min-w-0 flex-1 rounded-[15px] border border-gray-200 bg-white px-3 text-sm text-gray-900 focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 xl:rounded-lg";

const USE_MAX_CLASS =
  "h-11 shrink-0 rounded-[15px] border-gray-200 bg-white px-4 text-sm text-gray-900 hover:bg-gray-50 xl:rounded-lg";

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

export function CheckoutBonusRedeemField({
  bonus,
  isSubmitting,
}: CheckoutBonusRedeemFieldProps) {
  const availableText = bonus.labels.available.replace(
    "{amount}",
    bonus.formatMoney(bonus.availableBalance),
  );

  return (
    <div className="relative z-[2]">
      <p className="mb-1 text-sm text-gray-900 xl:text-white/80">
        {bonus.labels.title}
      </p>
      <p className="mb-3 text-sm text-gray-600 xl:text-white/70">
        {availableText}
      </p>
      <label className="flex items-center gap-2 text-sm text-gray-900 xl:text-white">
        <input
          type="checkbox"
          checked={bonus.useBonuses}
          onChange={(event) => bonus.onToggle(event.target.checked)}
          disabled={isSubmitting || bonus.maxRedeem <= 0}
          className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
        />
        {bonus.labels.useBonuses}
      </label>
      {bonus.useBonuses ? (
        <div className="mt-3 flex gap-2">
          <input
            type="number"
            min={0}
            max={bonus.maxRedeem}
            step={1}
            value={bonus.redeemAmount}
            onChange={(event) => {
              const next = Number(event.target.value);
              bonus.onAmountChange(
                Number.isFinite(next) ? Math.max(0, Math.floor(next)) : 0,
              );
            }}
            disabled={isSubmitting}
            aria-label={bonus.labels.amount}
            className={INPUT_CLASS}
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            className={USE_MAX_CLASS}
            disabled={isSubmitting || bonus.maxRedeem <= 0}
            onClick={bonus.onUseMax}
          >
            {bonus.labels.useMax}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
