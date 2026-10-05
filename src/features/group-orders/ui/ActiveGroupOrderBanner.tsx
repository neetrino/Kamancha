"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Users } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { leaveGroupOrderSessionAction } from "@/features/group-orders/actions";
import { GroupOrderRemoteCancelWatcher } from "@/features/group-orders/ui/GroupOrderRemoteCancelWatcher";
import { LeaveGroupOrderDialog } from "@/features/group-orders/ui/LeaveGroupOrderDialog";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type ActiveGroupOrderBannerProps = {
  locale: Locale;
  labels: Dictionary["groupOrder"];
  organizerDisplayName: string;
  inviteToken: string;
  isOrganizer: boolean;
};

export function ActiveGroupOrderBanner({
  locale,
  labels,
  organizerDisplayName,
  inviteToken,
  isOrganizer,
}: ActiveGroupOrderBannerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function leave(): void {
    startTransition(async () => {
      await leaveGroupOrderSessionAction();
      setConfirmOpen(false);
      router.push(`/${locale}`);
      router.refresh();
    });
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
      <GroupOrderRemoteCancelWatcher
        inviteToken={inviteToken}
        locale={locale}
        enabled={!isOrganizer}
        cancelledMessage={labels.organizerCancelledAlert}
      />
      <div className="rounded-2xl bg-white px-4 py-2.5 shadow-sm sm:rounded-full sm:px-5">
        <div className="flex flex-col gap-2 text-sm text-gray-900 sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2 font-medium sm:text-base">
            <Users className="h-6 w-6 shrink-0 text-brand-forest sm:hidden" aria-hidden />
            <Users className="hidden h-5 w-5 shrink-0 text-brand-forest sm:block" strokeWidth={2.75} aria-hidden />
            {labels.activeSessionBanner.replace("{name}", organizerDisplayName)}
          </p>
          <div className="flex items-center justify-end gap-2">
            <AppLink
              href={`/${locale}/group-orders/${inviteToken}`}
              prefetchPolicy="intent"
              className="rounded-full bg-brand-forest px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2c4823]"
            >
              {labels.viewGroupOrder}
            </AppLink>
            <button
              type="button"
              disabled={pending}
              className="rounded-full bg-red-500 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:opacity-50"
              onClick={() => setConfirmOpen(true)}
            >
              {labels.leaveSession}
            </button>
          </div>
        </div>
      </div>
      <LeaveGroupOrderDialog
        open={confirmOpen}
        title={
          isOrganizer ? labels.leaveConfirmTitle : labels.leaveConfirmSelfTitle
        }
        description={
          isOrganizer ? labels.leaveConfirmBody : labels.leaveConfirmSelfBody
        }
        continueLabel={labels.leaveConfirmContinue}
        confirmLabel={
          isOrganizer
            ? labels.leaveConfirmEveryone
            : labels.leaveConfirmSelfAction
        }
        closeLabel={labels.close}
        isPending={pending}
        onContinue={() => {
          if (!pending) setConfirmOpen(false);
        }}
        onConfirm={leave}
      />
    </div>
  );
}
