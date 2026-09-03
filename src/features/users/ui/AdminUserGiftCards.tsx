"use client";

import { Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Card } from "@/components/ui/Card";
import { ADMIN_SECTION_TITLE } from "@/features/admin/ui/admin-form-classes";
import { ADMIN_BADGE } from "@/features/admin/ui/status-badge";
import {
  adminActivateGiftCardAction,
  adminDisableGiftCardAction,
  adminResendGiftCardEmailAction,
  getAdminGiftCardDetailAction,
} from "@/features/gift-cards/application/admin-actions";
import type { GiftCardDetail } from "@/features/gift-cards/application/queries";
import { GiftCardDetailSheet } from "@/features/gift-cards/ui/GiftCardDetailSheet";
import type { AdminUserGiftCard } from "@/features/users/application/queries";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type AdminUserGiftCardsProps = {
  locale: Locale;
  userId: string;
  userEmail: string;
  cards: AdminUserGiftCard[];
  copy: Dictionary["admin"]["users"]["detail"]["giftCards"];
  adminCopy: Dictionary["admin"];
};

function giftCardStatusBadgeClass(
  status: AdminUserGiftCard["status"],
): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-800";
    case "PENDING_PAYMENT":
      return "bg-yellow-100 text-yellow-800";
    case "DISABLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function resolveGiftCardRole(
  card: AdminUserGiftCard,
  userId: string,
  userEmail: string,
): "purchaser" | "recipient" | "both" {
  const email = userEmail.trim().toLowerCase();
  const isPurchaser = card.purchaserUserId === userId;
  const isRecipient =
    card.recipientUserId === userId ||
    card.recipientEmail.trim().toLowerCase() === email;

  if (isPurchaser && isRecipient) {
    return "both";
  }
  if (isPurchaser) {
    return "purchaser";
  }
  return "recipient";
}

export function AdminUserGiftCards({
  locale,
  userId,
  userEmail,
  cards,
  copy,
  adminCopy,
}: AdminUserGiftCardsProps) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<GiftCardDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDetailPending, startDetailTransition] = useTransition();
  const [isActionPending, startActionTransition] = useTransition();

  function openDetail(id: string): void {
    setDetailOpen(true);
    setDetail(null);
    setError(null);

    startDetailTransition(async () => {
      const card = await getAdminGiftCardDetailAction(locale, id);
      if (!card) {
        setDetailOpen(false);
        setError(adminCopy.common.actionFailed);
        return;
      }
      setDetail(card);
    });
  }

  function closeDetail(): void {
    setDetailOpen(false);
    setDetail(null);
    setError(null);
  }

  function runAction(action: () => Promise<void>): void {
    startActionTransition(async () => {
      setError(null);
      try {
        await action();
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : adminCopy.common.actionFailed,
        );
      }
    });
  }

  return (
    <>
      <Card className="mb-6 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-forest/10 text-brand-forest">
            <Gift className="h-5 w-5" aria-hidden />
          </span>
          <h2 className={ADMIN_SECTION_TITLE}>{copy.title}</h2>
        </div>

        {error && !detailOpen ? (
          <p className="mb-4 text-sm text-red-700">{error}</p>
        ) : null}

        {cards.length === 0 ? (
          <p className="text-sm text-gray-600">{copy.empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const role = resolveGiftCardRole(card, userId, userEmail);
              const roleLabel =
                role === "both"
                  ? copy.roleBoth
                  : role === "purchaser"
                    ? copy.rolePurchaser
                    : copy.roleRecipient;

              return (
                <button
                  key={card.id}
                  type="button"
                  className="rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                  onClick={() => openDetail(card.id)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm text-gray-900">{card.code}</strong>
                    <span
                      className={`${ADMIN_BADGE} ${giftCardStatusBadgeClass(card.status)}`}
                    >
                      {adminCopy.giftCards.statuses[card.status] ?? card.status}
                    </span>
                    <span className={`${ADMIN_BADGE} bg-blue-100 text-blue-800`}>
                      {roleLabel}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-brand-forest">
                    {formatMoneyAmount(card.balanceAmount, "AMD", locale)}
                    <span className="font-normal text-gray-500">
                      {" "}
                      / {formatMoneyAmount(card.initialAmount, "AMD", locale)}
                    </span>
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <GiftCardDetailSheet
        open={detailOpen}
        onClose={closeDetail}
        detail={detail}
        isLoading={isDetailPending}
        isActionPending={isActionPending}
        locale={locale}
        copy={{
          giftCards: adminCopy.giftCards,
          common: adminCopy.common,
        }}
        onActivate={
          detail
            ? () =>
                runAction(async () => {
                  const result = await adminActivateGiftCardAction(locale, {
                    id: detail.id,
                  });
                  if (!result.ok) {
                    throw new Error(result.error.message);
                  }
                  const refreshed = await getAdminGiftCardDetailAction(
                    locale,
                    detail.id,
                  );
                  if (refreshed) {
                    setDetail(refreshed);
                  }
                })
            : undefined
        }
        onResendEmail={
          detail
            ? () =>
                runAction(async () => {
                  const result = await adminResendGiftCardEmailAction(locale, {
                    id: detail.id,
                  });
                  if (!result.ok) {
                    throw new Error(result.error.message);
                  }
                })
            : undefined
        }
        onDisable={
          detail
            ? () =>
                runAction(async () => {
                  const result = await adminDisableGiftCardAction(locale, {
                    id: detail.id,
                  });
                  if (!result.ok) {
                    throw new Error(result.error.message);
                  }
                  const refreshed = await getAdminGiftCardDetailAction(
                    locale,
                    detail.id,
                  );
                  if (refreshed) {
                    setDetail(refreshed);
                  }
                })
            : undefined
        }
      />
    </>
  );
}
