"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { SideSheet } from "@/components/ui/SideSheet";
import { LegalDocumentView } from "@/features/legal/ui/LegalDocumentView";
import type { LegalPolicyKey } from "@/features/legal/ui/LegalPolicyPage";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

const POLICY_KEYS: readonly LegalPolicyKey[] = ["delivery", "terms", "privacy"];

type LegalPolicySheetProps = {
  open: boolean;
  onClose: () => void;
  legal: Dictionary["legal"];
  /** Opens this document immediately. Omit to start on the policy list. */
  documentKey?: LegalPolicyKey | null;
};

/**
 * Policy list and document in the same side sheet used by the policies hub.
 * Opened from the mobile menu on the sign-in page so the form stays put.
 */
export function LegalPolicySheet({
  open,
  onClose,
  legal,
  documentKey = null,
}: LegalPolicySheetProps) {
  const [pickedKey, setPickedKey] = useState<LegalPolicyKey | null>(null);
  const activeKey = documentKey ?? pickedKey;
  const active = activeKey ? legal[activeKey] : null;

  function closeSheet(): void {
    setPickedKey(null);
    onClose();
  }

  return (
    <SideSheet
      open={open}
      onClose={closeSheet}
      ariaLabel={active?.title ?? legal.hubTitle}
      panelClassName="w-[87%] max-w-[420px]"
      zIndexClassName="z-[200]"
      backdropBlur
      closeButtonClassName="side-sheet-close-stroke bg-[#335329] text-white hover:bg-[#2c4823]"
    >
      <PolicySheetHeader
        title={active?.title ?? legal.hubTitle}
        backLabel={legal.hubTitle}
        showBack={documentKey == null && active != null}
        onBack={() => setPickedKey(null)}
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        {active ? (
          <LegalDocumentView
            copy={active}
            lastUpdatedLabel={legal.lastUpdatedLabel}
            variant="sheet"
          />
        ) : (
          <PolicyList legal={legal} onSelect={setPickedKey} />
        )}
      </div>
    </SideSheet>
  );
}

function PolicySheetHeader({
  title,
  backLabel,
  showBack,
  onBack,
}: {
  title: string;
  backLabel: string;
  showBack: boolean;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-5">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label={backLabel}
          className="-ml-2 flex size-9 shrink-0 items-center justify-center rounded-full text-gray-900 hover:bg-gray-50"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
      ) : null}
      <h2 className="font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
        {title}
      </h2>
    </div>
  );
}

function PolicyList({
  legal,
  onSelect,
}: {
  legal: Dictionary["legal"];
  onSelect: (key: LegalPolicyKey) => void;
}) {
  return (
    <ul className="flex flex-col">
      {POLICY_KEYS.map((key) => (
        <li key={key} className="border-b border-gray-100 last:border-b-0">
          <button
            type="button"
            onClick={() => onSelect(key)}
            className="flex w-full items-center justify-between gap-3 py-4 text-left"
          >
            <span className="font-big-fat-boii text-base font-normal tracking-wide text-gray-900 uppercase">
              {legal[key].title}
            </span>
            <ChevronRight className="size-5 shrink-0 text-gray-500" aria-hidden />
          </button>
        </li>
      ))}
    </ul>
  );
}
