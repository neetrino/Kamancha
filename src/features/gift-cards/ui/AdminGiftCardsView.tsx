"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check, Copy, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminSearchInput } from "@/features/admin/ui/AdminSearchInput";
import {
  ADMIN_PAGE_SUBTITLE,
  ADMIN_PAGE_TITLE,
} from "@/features/admin/ui/admin-form-classes";
import {
  ADMIN_TABLE,
  ADMIN_TABLE_CARD,
  ADMIN_TABLE_OUTER_SCROLL,
  ADMIN_TABLE_ROW,
  ADMIN_TABLE_STATE_INSET,
  ADMIN_TABLE_TBODY,
  ADMIN_TABLE_TD,
  ADMIN_TABLE_TH,
  ADMIN_TABLE_THEAD,
} from "@/features/admin/ui/admin-table-classes";
import {
  adminActivateGiftCardAction,
  adminDisableGiftCardAction,
  adminResendGiftCardEmailAction,
  getAdminGiftCardDetailAction,
} from "@/features/gift-cards/application/admin-actions";
import type {
  GiftCardDetail,
  GiftCardListItem,
} from "@/features/gift-cards/application/queries";
import { GiftCardDetailSheet } from "@/features/gift-cards/ui/GiftCardDetailSheet";
import { GiftCardDrawer } from "@/features/gift-cards/ui/GiftCardDrawer";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import { formatMoneyAmount } from "@/lib/money/format";

type AdminGiftCardsViewCopy = {
  giftCards: Dictionary["admin"]["giftCards"];
  common: Dictionary["admin"]["common"];
};

type AdminGiftCardsViewProps = {
  locale: string;
  cards: GiftCardListItem[];
  presets: number[];
  q?: string;
  copy: AdminGiftCardsViewCopy;
};

export function AdminGiftCardsView({
  locale,
  cards,
  presets,
  q,
  copy,
}: AdminGiftCardsViewProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<GiftCardDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDetailPending, startDetailTransition] = useTransition();

  function openDetail(id: string): void {
    setDetailOpen(true);
    setDetail(null);
    startDetailTransition(async () => {
      const card = await getAdminGiftCardDetailAction(locale, id);
      if (!card) {
        setDetailOpen(false);
        setError(copy.common.actionFailed);
        return;
      }
      setDetail(card);
    });
  }

  function closeDetail(): void {
    setDetailOpen(false);
    setDetail(null);
  }

  function runAction(action: () => Promise<void>): void {
    startTransition(async () => {
      setError(null);
      try {
        await action();
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : copy.common.actionFailed,
        );
      }
    });
  }

  return (
    <section>
      <div className="mb-4">
        <h1 className={ADMIN_PAGE_TITLE}>{copy.giftCards.title}</h1>
        <p className={`mt-1 ${ADMIN_PAGE_SUBTITLE}`}>{copy.giftCards.subtitle}</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form method="get" className="min-w-0 flex-1">
          <AdminSearchInput
            name="q"
            defaultValue={q ?? ""}
            placeholder={copy.giftCards.searchPlaceholder}
            aria-label={copy.giftCards.searchPlaceholder}
          />
        </form>
        <Button
          type="button"
          size="field"
          className="shrink-0 gap-2 whitespace-nowrap"
          onClick={() => {
            setDrawerKey((key) => key + 1);
            setDrawerOpen(true);
          }}
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden />
          {copy.giftCards.add}
        </Button>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Card className={ADMIN_TABLE_CARD}>
        <div className={ADMIN_TABLE_OUTER_SCROLL}>
          <table className={ADMIN_TABLE}>
            <thead className={ADMIN_TABLE_THEAD}>
              <tr>
                <th className={ADMIN_TABLE_TH}>{copy.giftCards.table.code}</th>
                <th className={ADMIN_TABLE_TH}>{copy.giftCards.table.balance}</th>
                <th className={ADMIN_TABLE_TH}>{copy.giftCards.table.status}</th>
                <th className={ADMIN_TABLE_TH}>
                  {copy.giftCards.table.recipient}
                </th>
                <th className={ADMIN_TABLE_TH}>
                  {copy.giftCards.table.purchaser}
                </th>
              </tr>
            </thead>
            <tbody className={ADMIN_TABLE_TBODY}>
              {cards.length === 0 ? (
                <tr>
                  <td colSpan={5} className={ADMIN_TABLE_STATE_INSET}>
                    {copy.giftCards.empty}
                  </td>
                </tr>
              ) : (
                cards.map((card) => (
                  <tr
                    key={card.id}
                    className={`${ADMIN_TABLE_ROW} cursor-pointer`}
                    onClick={() => openDetail(card.id)}
                  >
                    <td className={ADMIN_TABLE_TD}>
                      <div className="inline-flex items-center gap-1.5">
                        <span className="font-mono text-xs tracking-wide">
                          {card.code}
                        </span>
                        <button
                          type="button"
                          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          disabled={isPending}
                          aria-label={copy.giftCards.table.copyAria.replace(
                            "{code}",
                            card.code,
                          )}
                          onClick={(event) => {
                            event.stopPropagation();
                            void navigator.clipboard.writeText(card.code);
                            setCopiedId(card.id);
                          }}
                        >
                          {copiedId === card.id ? (
                            <Check className="h-3.5 w-3.5" aria-hidden />
                          ) : (
                            <Copy className="h-3.5 w-3.5" aria-hidden />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      {formatMoneyAmount(card.balanceAmount, "AMD", locale)}
                      <span className="block text-xs text-gray-500">
                        / {formatMoneyAmount(card.initialAmount, "AMD", locale)}
                      </span>
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      {copy.giftCards.statuses[card.status] ?? card.status}
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <div className="text-sm">{card.recipientName}</div>
                      <div className="text-xs text-gray-500">
                        {card.recipientEmail}
                      </div>
                    </td>
                    <td className={ADMIN_TABLE_TD}>
                      <div className="text-sm">{card.purchaserName}</div>
                      <div className="text-xs text-gray-500">
                        {card.purchaserEmail ?? "—"}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <GiftCardDetailSheet
        open={detailOpen}
        onClose={closeDetail}
        detail={detail}
        isLoading={isDetailPending}
        isActionPending={isPending}
        locale={locale}
        copy={{
          giftCards: copy.giftCards,
          common: copy.common,
        }}
        onActivate={
          detail?.status === "PENDING_PAYMENT"
            ? () =>
                runAction(async () => {
                  const result = await adminActivateGiftCardAction(locale, {
                    id: detail.id,
                  });
                  if (!result.ok) {
                    throw new Error(result.error.message);
                  }
                  closeDetail();
                })
            : undefined
        }
        onResendEmail={
          detail?.status === "ACTIVE" || detail?.status === "USED"
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
          detail != null && detail.status !== "DISABLED"
            ? () =>
                runAction(async () => {
                  const result = await adminDisableGiftCardAction(locale, {
                    id: detail.id,
                  });
                  if (!result.ok) {
                    throw new Error(result.error.message);
                  }
                  closeDetail();
                })
            : undefined
        }
      />

      <GiftCardDrawer
        key={drawerKey}
        locale={locale}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        presets={presets}
        copy={{
          drawer: copy.giftCards.drawer,
          common: copy.common,
        }}
      />
    </section>
  );
}
