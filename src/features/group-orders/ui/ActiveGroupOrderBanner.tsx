"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Users } from "lucide-react";

import { AppLink } from "@/components/ui/AppLink";
import { leaveGroupOrderSessionAction } from "@/features/group-orders/actions";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type ActiveGroupOrderBannerProps = {
  locale: Locale;
  labels: Dictionary["groupOrder"];
  organizerDisplayName: string;
  inviteToken: string;
};

export function ActiveGroupOrderBanner({
  locale,
  labels,
  organizerDisplayName,
  inviteToken,
}: ActiveGroupOrderBannerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
      <div className="liquid-glass isolate overflow-hidden rounded-2xl px-4 py-2.5">
        <div className="relative z-[2] flex flex-wrap items-center justify-between gap-2 text-sm text-white">
          <p className="inline-flex items-center gap-2 font-medium">
            <Users className="h-4 w-4 shrink-0" aria-hidden />
            {labels.activeSessionBanner.replace("{name}", organizerDisplayName)}
          </p>
          <div className="flex items-center gap-3">
            <AppLink
              href={`/${locale}/group-orders/${inviteToken}`}
              prefetchPolicy="intent"
              className="font-semibold text-white underline-offset-2 hover:underline"
            >
              {labels.viewGroupOrder}
            </AppLink>
            <button
              type="button"
              disabled={pending}
              className="text-white hover:text-white/80 disabled:opacity-50"
              onClick={() => {
                startTransition(async () => {
                  await leaveGroupOrderSessionAction();
                  router.refresh();
                });
              }}
            >
              {labels.leaveSession}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
