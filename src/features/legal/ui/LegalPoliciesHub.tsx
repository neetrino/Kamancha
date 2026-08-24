"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { SideSheet } from "@/components/ui/SideSheet";
import {
  LegalDocumentView,
  type LegalDocumentCopy,
} from "@/features/legal/ui/LegalDocumentView";
import type { LegalPolicyKey } from "@/features/legal/ui/LegalPolicyPage";

export type LegalPolicyListItem = {
  key: LegalPolicyKey;
  copy: LegalDocumentCopy;
};

type LegalPoliciesHubProps = {
  title: string;
  lastUpdatedLabel: string;
  policies: LegalPolicyListItem[];
};

/**
 * Policies hub — list of legal documents; each opens in a side sheet.
 */
export function LegalPoliciesHub({
  title,
  lastUpdatedLabel,
  policies,
}: LegalPoliciesHubProps) {
  const [activeKey, setActiveKey] = useState<LegalPolicyKey | null>(null);
  const active = policies.find((policy) => policy.key === activeKey) ?? null;

  return (
    <>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="font-big-fat-boii text-2xl font-normal tracking-wide text-white uppercase">
          {title}
        </h1>

        <ul className="flex flex-col gap-3">
          {policies.map((policy) => (
            <li key={policy.key}>
              <button
                type="button"
                onClick={() => setActiveKey(policy.key)}
                className="liquid-glass flex w-full items-center justify-between gap-3 rounded-[15px] px-4 py-4 text-left transition hover:bg-white/10"
              >
                <span className="text-base font-semibold text-white">
                  {policy.copy.title}
                </span>
                <ChevronRight
                  className="size-5 shrink-0 text-white"
                  aria-hidden
                />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <SideSheet
        open={active != null}
        onClose={() => setActiveKey(null)}
        ariaLabel={active?.copy.title ?? title}
        panelClassName="w-[87%] max-w-[420px]"
        zIndexClassName="z-[200]"
        backdropBlur
        closeButtonClassName="side-sheet-close-stroke bg-[#335329] text-white hover:bg-[#2c4823]"
      >
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
            {active?.copy.title ?? title}
          </h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {active ? (
            <LegalDocumentView
              copy={active.copy}
              lastUpdatedLabel={lastUpdatedLabel}
              variant="sheet"
            />
          ) : null}
        </div>
      </SideSheet>
    </>
  );
}
