"use client";

import type { ReactNode } from "react";
import Picker from "react-mobile-picker";

import { BottomSheet } from "@/components/ui/BottomSheet";

export type DeliverySlotWheelColumnModel = {
  name: string;
  options: readonly { value: string; label: string }[];
};

type DeliverySlotWheelsProps = {
  value: Record<string, string>;
  columns: readonly DeliverySlotWheelColumnModel[];
  onChange: (value: Record<string, string>, key: string) => void;
};

/** Default iOS drum wheel. The gray bar marks the selected row. */
export function DeliverySlotWheels({
  value,
  columns,
  onChange,
}: DeliverySlotWheelsProps) {
  return (
    <div
      className="relative"
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 rounded-lg bg-gray-100"
        style={{ height: 36 }}
        aria-hidden
      />
      <div className="relative z-[2] [&_.picker-item]:text-gray-300">
        <Picker
          className="delivery-time-wheel [&>div:last-child]:hidden"
          value={value}
          onChange={onChange}
          wheelMode="natural"
        >
          {columns.map((column) => (
            <Picker.Column key={column.name} name={column.name}>
              {column.options.map((option) => (
                <Picker.Item key={option.value} value={option.value}>
                  {({ selected }) => (
                    <span
                      className={
                        selected
                          ? "text-[17px] font-semibold text-gray-900"
                          : "text-[17px] font-medium text-gray-300"
                      }
                    >
                      {option.label}
                    </span>
                  )}
                </Picker.Item>
              ))}
            </Picker.Column>
          ))}
        </Picker>
      </div>
    </div>
  );
}

type DeliverySlotWheelSheetProps = {
  open: boolean;
  title: string;
  applyLabel: string;
  closeLabel: string;
  onClose: () => void;
  onApply: () => void;
  children: ReactNode;
};

/** Compact bottom sheet with a centered wheel and an Apply action. */
export function DeliverySlotWheelSheet({
  open,
  title,
  applyLabel,
  closeLabel,
  onClose,
  onApply,
  children,
}: DeliverySlotWheelSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel={title}
      closeLabel={closeLabel}
      zIndexClassName="z-[230]"
      panelClassName="!h-auto bg-white text-gray-900 [&>div:first-child>div]:!bg-gray-300 [&>div:last-child]:!flex-none"
    >
      <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <h2 className="mb-2 text-lg font-bold text-gray-900">{title}</h2>
        {children}
        <button
          type="button"
          onClick={onApply}
          className="mt-6 w-full rounded-full bg-brand-forest py-3.5 text-base font-semibold text-white"
        >
          {applyLabel}
        </button>
      </div>
    </BottomSheet>
  );
}

