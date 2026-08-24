"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Copy,
  Share2,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { AddressMapPicker } from "@/components/ui/AddressMapPicker";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { GroupOrderSummary } from "@/features/group-orders/ui/GroupOrderSummary";
import {
  cancelGroupOrderAction,
  joinGroupOrderAction,
  lockGroupOrderAction,
  markItemsReadyAction,
  prepareGroupOrderCheckoutAction,
  removeGroupOrderItemAction,
  removeParticipantAction,
  setDeliveryAddressAction,
  setJoinsClosedAction,
  updateSpendLimitAction,
} from "@/features/group-orders/actions";
import type {
  GroupOrderDetailView,
  GroupOrderItemView,
} from "@/features/group-orders/application/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { STOREFRONT_PRODUCT_PHOTO } from "@/lib/media/storefront-product-photo";

const GLASS_PILL_BUTTON =
  "inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 disabled:cursor-not-allowed disabled:opacity-50";

const GLASS_ACTION_BUTTON =
  "inline-flex items-center justify-center rounded-[15px] bg-white px-4 py-2 text-sm font-semibold text-gray-900 disabled:cursor-not-allowed disabled:opacity-50";

const PILL_FULL = "max-w-none sm:max-w-none";

const BLOCK_TITLE =
  "font-big-fat-boii text-base font-normal tracking-wide text-white uppercase";

const PRODUCT_THUMB_PX = 96;
const PRODUCT_THUMB_RADIUS_PX = 16;
const PRODUCT_CARD_MIN_PX = 200;
const PRODUCT_CARD_MAX_PX = 320;
const PRODUCT_TITLE_MAX_PX = 180;

type PendingConfirm =
  | { kind: "participant"; id: string; name: string }
  | { kind: "item"; id: string; name: string }
  | { kind: "cancel" };

type GroupOrderPageClientProps = {
  locale: Locale;
  labels: Dictionary["groupOrder"];
  initialView: GroupOrderDetailView | null;
  inviteToken: string;
  needsJoin: boolean;
};

function absoluteInviteUrl(invitePath: string): string {
  return `${window.location.origin}${invitePath}`;
}

function paymentLabel(
  status: string,
  labels: Dictionary["groupOrder"],
  options?: { paysAtCheckout?: boolean },
): string {
  if (options?.paysAtCheckout) {
    return labels.statusPaysAtCheckout;
  }
  switch (status) {
    case "PAID":
      return labels.statusPaid;
    case "FAILED":
      return labels.statusFailed;
    case "NOT_REQUIRED":
      return labels.statusNotRequired;
    case "REFUNDED":
      return labels.statusRefunded;
    case "MARKED_RECEIVED":
      return labels.statusMarkedReceived;
    default:
      return labels.statusPending;
  }
}

export function GroupOrderPageClient({
  locale,
  labels,
  initialView,
  inviteToken,
  needsJoin,
}: GroupOrderPageClientProps) {
  const router = useRouter();
  const view = initialView;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joinName, setJoinName] = useState("");
  const [spendLimit, setSpendLimit] = useState(
    initialView?.spendLimitAmount?.toString() ?? "",
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    initialView?.deliveryAddress ?? "",
  );
  const [deliveryPoint, setDeliveryPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null,
  );

  const isOrganizer = view?.currentParticipantRole === "ORGANIZER";
  const canEdit = view?.status === "OPEN";
  const currentParticipant = view?.participants.find(
    (participant) => participant.id === view.currentParticipantId,
  );
  const iAmReady = currentParticipant?.itemsReady ?? false;

  if (!view) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-lg font-semibold text-white">{labels.notFound}</p>
      </div>
    );
  }

  if (needsJoin && !view.currentParticipantId) {
    return (
      <JoinPanel
        labels={labels}
        view={view}
        joinName={joinName}
        setJoinName={setJoinName}
        pending={pending}
        error={error}
        onJoin={() => {
          setError(null);
          startTransition(async () => {
            const result = await joinGroupOrderAction({
              inviteToken,
              displayName: joinName.trim(),
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
      />
    );
  }

  function run(
    action: () => Promise<{ ok: boolean; error?: string }>,
  ): void {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? labels.errorGeneric);
        return;
      }
      router.refresh();
    });
  }

  function pendingConfirmDescription(): string {
    if (!pendingConfirm) return "";
    if (pendingConfirm.kind === "participant") {
      return labels.confirm.removeParticipant.replace(
        "{name}",
        pendingConfirm.name,
      );
    }
    if (pendingConfirm.kind === "item") {
      return labels.confirm.removeItem.replace("{name}", pendingConfirm.name);
    }
    return labels.confirm.cancelOrder;
  }

  function confirmPendingDelete(): void {
    if (!pendingConfirm) return;
    const next = pendingConfirm;
    setPendingConfirm(null);
    if (next.kind === "participant") {
      run(async () =>
        removeParticipantAction({
          inviteToken,
          participantId: next.id,
        }),
      );
      return;
    }
    if (next.kind === "item") {
      run(async () =>
        removeGroupOrderItemAction({
          inviteToken,
          itemId: next.id,
        }),
      );
      return;
    }
    run(async () => cancelGroupOrderAction({ inviteToken }));
  }

  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(absoluteInviteUrl(view.invitePath));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(labels.errorGeneric);
    }
  }

  async function shareLink(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: labels.manageTitle,
          url: absoluteInviteUrl(view.invitePath),
        });
      } catch {
        /* user cancelled */
      }
      return;
    }
    await copyLink();
  }

  return (
    <div
      className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${pending ? "opacity-70" : ""}`}
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-big-fat-boii text-[40px] leading-[1.1] font-normal tracking-wide text-white uppercase sm:text-[48px] md:text-[58px]">
            {labels.manageTitle}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {labels.status}: {view.status}
          </p>
        </div>
        <div className="w-full max-w-[280px] shrink-0 sm:max-w-[316px]">
          <KamanchaPillButton
            href={`/${locale}/products`}
            label={labels.browseMenu}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="space-y-6">
      <section className="liquid-glass isolate overflow-hidden rounded-3xl p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className={BLOCK_TITLE}>{labels.inviteLink}</p>
            <p className="mt-1 truncate text-xs text-white">
              {view.invitePath}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <button
              type="button"
              className={GLASS_PILL_BUTTON}
              onClick={copyLink}
            >
              <Copy className="mr-1.5 h-4 w-4" />
              {copied ? labels.copied : labels.copyLink}
            </button>
            <button
              type="button"
              className={GLASS_PILL_BUTTON}
              onClick={shareLink}
            >
              <Share2 className="mr-1.5 h-4 w-4" />
              {labels.share}
            </button>
          </div>
        </div>
      </section>

      {isOrganizer && canEdit ? (
        <section>
          <h2 className="mb-3 font-big-fat-boii text-base font-normal tracking-wide text-white uppercase">
            {labels.settingsTitle}
          </h2>
          <div className="space-y-5 liquid-glass isolate overflow-hidden rounded-3xl p-4">
          <div className="space-y-2">
            <label className="block">
              <span className={BLOCK_TITLE}>{labels.spendLimitFieldLabel}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-white">
                {labels.spendLimitFieldHint}
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[8rem] flex-1 items-center gap-2 rounded-[15px] border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="text-sm text-gray-500" aria-hidden>
                  ֏
                </span>
                <input
                  value={spendLimit}
                  onChange={(e) => setSpendLimit(e.target.value)}
                  inputMode="numeric"
                  placeholder={labels.spendLimitPlaceholder}
                  aria-label={labels.spendLimitFieldLabel}
                  className="w-full bg-transparent text-sm text-gray-900 outline-none"
                />
              </div>
              <button
                type="button"
                className={GLASS_ACTION_BUTTON}
                onClick={() =>
                  run(async () =>
                    updateSpendLimitAction({
                      inviteToken,
                      spendLimitAmount: spendLimit.trim()
                        ? Number.parseInt(spendLimit, 10)
                        : null,
                    }),
                  )
                }
              >
                {labels.saveLimit}
              </button>
            </div>
          </div>

          <div className="space-y-2 border-t border-white/40 pt-4">
            <label className="block">
              <span className={BLOCK_TITLE}>{labels.deliveryFieldLabel}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-white">
                {labels.deliveryFieldHint}
              </span>
            </label>
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <AddressAutocomplete
                  value={deliveryAddress}
                  onValueChange={(value) => {
                    setDeliveryAddress(value);
                    setDeliveryPoint(null);
                  }}
                  placeholder={labels.deliveryAddressPlaceholder}
                  languageCode={locale}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400"
                />
              </div>
              <AddressMapPicker
                addressValue={deliveryAddress}
                disabled={pending}
                onAddressSelected={(address) => {
                  setDeliveryAddress(address);
                  setDeliveryPoint(null);
                }}
                labels={{
                  openMap: labels.openMap,
                  title: labels.mapTitle,
                  hint: labels.mapHint,
                  confirm: labels.mapConfirm,
                  cancel: labels.mapCancel,
                  resolving: labels.mapResolving,
                }}
              />
            </div>
            <p className="text-xs leading-relaxed text-white">
              {view.paymentMode === "SPLIT_PER_PARTICIPANT"
                ? labels.deliverySplitHint
                : labels.deliveryOrganizerPaysHint}
            </p>
            {view.deliveryAmount > 0 ? (
              <p className="text-sm font-medium text-emerald-200">
                {labels.deliveryQuoteReady
                  .replace("{amount}", view.deliveryFormatted)
                  .replace(
                    "{distance}",
                    view.deliveryDistanceLabel ?? "—",
                  )}
              </p>
            ) : null}
            <button
              type="button"
              className={GLASS_PILL_BUTTON}
              disabled={pending || deliveryAddress.trim().length < 3}
              onClick={() =>
                run(async () =>
                  setDeliveryAddressAction({
                    inviteToken,
                    deliveryAddress: deliveryAddress.trim(),
                    deliveryLat: deliveryPoint?.lat,
                    deliveryLng: deliveryPoint?.lng,
                  }),
                )
              }
            >
              {labels.calculateDelivery}
            </button>
          </div>

          <div className="space-y-2 border-t border-white/40 pt-4">
            <p className="text-xs leading-relaxed text-white">
              {labels.closeJoinsHint}
            </p>
            <button
              type="button"
              className={`${GLASS_PILL_BUTTON} w-full sm:w-auto`}
              onClick={() =>
                run(async () =>
                  setJoinsClosedAction({
                    inviteToken,
                    joinsClosed: !view.joinsClosed,
                  }),
                )
              }
            >
              {view.joinsClosed ? labels.openJoins : labels.closeJoins}
            </button>
          </div>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 font-big-fat-boii text-base font-normal tracking-wide text-white uppercase">
          {labels.participants}
        </h2>
        <ul className="space-y-4">
          {view.participants.map((participant) => (
            <li
              key={participant.id}
              className="liquid-glass isolate overflow-hidden rounded-3xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={BLOCK_TITLE}>
                    {participant.displayName}
                    {participant.role === "ORGANIZER" ? (
                      <span className="ml-2 text-xs font-normal text-white/70">
                        ({labels.organizer})
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm text-white">
                    {participant.subtotalFormatted} ·{" "}
                    {paymentLabel(participant.paymentStatus, labels, {
                      paysAtCheckout:
                        view.paymentMode === "SPLIT_PER_PARTICIPANT" &&
                        participant.role === "ORGANIZER" &&
                        participant.paymentStatus !== "PAID" &&
                        participant.paymentStatus !== "MARKED_RECEIVED" &&
                        (view.status === "AWAITING_PAYMENTS" ||
                          view.status === "CHECKOUT"),
                    })}
                  </p>
                  {view.paymentMode === "SPLIT_PER_PARTICIPANT" ? (
                    <p className="mt-0.5 text-xs text-white/70">
                      {labels.deliveryShare}:{" "}
                      {participant.deliveryShareFormatted} · {labels.total}:{" "}
                      {participant.finalAmountFormatted}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <p
                    className={`inline-flex rounded-full bg-white px-3.5 py-1 text-xs font-medium ${
                      participant.itemsReady
                        ? "text-brand-forest"
                        : "text-amber-500"
                    }`}
                  >
                    {participant.itemsReady ? labels.ready : labels.notReady}
                  </p>
                  {isOrganizer &&
                  participant.role !== "ORGANIZER" &&
                  canEdit ? (
                    <button
                      type="button"
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white/60 hover:bg-white/15 hover:text-red-300"
                      aria-label={labels.removeParticipant}
                      onClick={() =>
                        setPendingConfirm({
                          kind: "participant",
                          id: participant.id,
                          name: participant.displayName,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              {participant.items.length === 0 ? (
                <p className="mt-3 text-sm text-white/70">{labels.emptyItems}</p>
              ) : (
                <ul className="relative z-[2] mt-3 flex gap-3 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {participant.items.map((item) => (
                    <li key={item.id}>
                      <GroupOrderProductCard
                        item={item}
                        removeItemLabel={labels.removeItem}
                        canRemove={
                          (isOrganizer ||
                            participant.id === view.currentParticipantId) &&
                          canEdit
                        }
                        onRemove={(itemId) =>
                          setPendingConfirm({
                            kind: "item",
                            id: itemId,
                            name: item.title,
                          })
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      </div>

      <div>
      <GroupOrderSummary
        labels={labels}
        view={view}
        currentParticipant={currentParticipant}
        actions={
          <div className="space-y-3">
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            {canEdit && view.currentParticipantId ? (
              iAmReady ? (
                <div
                  className="rounded-[21px] bg-white px-5 py-4 text-center"
                  role="status"
                >
                  <p className="font-big-fat-boii text-base font-normal tracking-wide text-brand-forest uppercase">
                    {labels.itemsReadyDone}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-forest">
                    {labels.itemsReadyDoneHint}
                  </p>
                </div>
              ) : (
                <KamanchaPillButton
                  type="button"
                  variant="light"
                  label={labels.itemsReady}
                  className={PILL_FULL}
                  disabled={pending}
                  onClick={() => {
                    setError(null);
                    startTransition(async () => {
                      const result = await markItemsReadyAction({
                        inviteToken,
                      });
                      if (!result.ok) {
                        setError(result.error ?? labels.errorGeneric);
                        return;
                      }
                      router.refresh();
                    });
                  }}
                />
              )
            ) : null}

            {isOrganizer && canEdit ? (
              <KamanchaPillButton
                type="button"
                variant="light"
                label={labels.lockAndContinue}
                className={PILL_FULL}
                disabled={pending}
                onClick={() =>
                  run(async () => lockGroupOrderAction({ inviteToken }))
                }
              />
            ) : null}

            {isOrganizer && view.status === "CHECKOUT" ? (
              <KamanchaPillButton
                type="button"
                variant="light"
                label={labels.goToCheckout}
                className={PILL_FULL}
                disabled={pending}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const result = await prepareGroupOrderCheckoutAction({
                      inviteToken,
                    });
                    if (!result.ok) {
                      setError(result.error ?? labels.errorGeneric);
                      return;
                    }
                    router.push(`/${locale}/checkout`);
                  });
                }}
              />
            ) : null}

            {view.paymentMode === "SPLIT_PER_PARTICIPANT" &&
            view.status === "AWAITING_PAYMENTS" &&
            !isOrganizer &&
            view.currentParticipantId &&
            currentParticipant &&
            currentParticipant.finalAmount > 0 &&
            currentParticipant.paymentStatus !== "PAID" &&
            currentParticipant.paymentStatus !== "MARKED_RECEIVED" ? (
              <KamanchaPillButton
                type="button"
                variant="light"
                label={labels.payWithCard.replace(
                  "{amount}",
                  currentParticipant.finalAmountFormatted,
                )}
                className={PILL_FULL}
                disabled={pending}
                onClick={() =>
                  router.push(`/${locale}/group-orders/${inviteToken}/pay`)
                }
              />
            ) : null}

            {view.paymentMode === "SPLIT_PER_PARTICIPANT" &&
            view.status === "AWAITING_PAYMENTS" &&
            !isOrganizer &&
            view.currentParticipantId &&
            currentParticipant &&
            (currentParticipant.paymentStatus === "PAID" ||
              currentParticipant.paymentStatus === "MARKED_RECEIVED") ? (
              <p className="rounded-3xl border border-brand-forest bg-white px-5 py-4 text-center text-sm text-brand-forest">
                {labels.payYouPaid}
              </p>
            ) : null}

            {isOrganizer && view.status === "AWAITING_PAYMENTS" ? (
              <p className="rounded-3xl border border-brand-forest bg-white px-5 py-4 text-center text-sm text-brand-forest">
                {labels.statusAwaitingCardPayments}
              </p>
            ) : null}

            {isOrganizer &&
            view.status !== "CANCELLED" &&
            view.status !== "COMPLETED" &&
            view.status !== "PAID" &&
            view.status !== "PREPARING" ? (
              <KamanchaPillButton
                type="button"
                variant="light"
                label={labels.cancelOrder}
                className={`${PILL_FULL} !text-red-700`}
                onClick={() => setPendingConfirm({ kind: "cancel" })}
              />
            ) : null}
          </div>
        }
      />
      </div>
      </div>
      <ConfirmDialog
        open={pendingConfirm !== null}
        title={
          pendingConfirm?.kind === "cancel"
            ? labels.cancelOrder
            : labels.confirm.deleteTitle
        }
        description={pendingConfirmDescription()}
        confirmLabel={
          pendingConfirm?.kind === "cancel"
            ? labels.confirm.cancelOrderConfirm
            : labels.confirm.confirmLabel
        }
        cancelLabel={labels.confirm.cancelLabel}
        isPending={pending}
        onClose={() => {
          if (!pending) setPendingConfirm(null);
        }}
        onConfirm={confirmPendingDelete}
      />
    </div>
  );
}

function JoinPanel({
  labels,
  view,
  joinName,
  setJoinName,
  pending,
  error,
  onJoin,
}: {
  labels: Dictionary["groupOrder"];
  view: GroupOrderDetailView;
  joinName: string;
  setJoinName: (value: string) => void;
  pending: boolean;
  error: string | null;
  onJoin: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <div className="liquid-glass isolate w-full overflow-hidden rounded-3xl p-6">
        <h1 className={BLOCK_TITLE}>
          {labels.joinTitle.replace("{name}", view.organizerDisplayName)}
        </h1>
        <p className="mt-2 text-sm text-white">{labels.joinDescription}</p>

        <div className="mt-5 space-y-3 text-sm text-white">
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {view.paymentMode === "ORGANIZER_PAYS_ALL"
              ? labels.payingOrganizer.replace(
                  "{name}",
                  view.organizerDisplayName,
                )
              : labels.payingSplit}
          </p>
          <p>
            {view.spendLimitFormatted
              ? labels.limitLabel.replace("{amount}", view.spendLimitFormatted)
              : labels.noLimit}
          </p>
        </div>

        <label className="mt-5 block">
          <span className={`mb-1.5 block ${BLOCK_TITLE}`}>
            {labels.joinNameLabel}
          </span>
          <input
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder={labels.joinNamePlaceholder}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-black outline-none placeholder:text-gray-500 focus:border-gray-400"
          />
        </label>

        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <KamanchaPillButton
          type="button"
          variant="light"
          label={labels.join}
          className={`${PILL_FULL} mt-5`}
          disabled={pending || !joinName.trim()}
          onClick={onJoin}
        />
      </div>
    </div>
  );
}

function GroupOrderProductCard({
  item,
  removeItemLabel,
  canRemove,
  onRemove,
}: {
  item: GroupOrderItemView;
  removeItemLabel: string;
  canRemove: boolean;
  onRemove: (itemId: string) => void;
}) {
  const imageSrc = item.imageUrl ?? STOREFRONT_PRODUCT_PHOTO;

  return (
    <article
      className="isolate w-max shrink-0 overflow-hidden rounded-[20px] bg-white p-3"
      style={{
        minWidth: PRODUCT_CARD_MIN_PX,
        maxWidth: PRODUCT_CARD_MAX_PX,
      }}
    >
      <div className="relative z-[2] flex items-stretch gap-3">
        <div
          className="relative block shrink-0 self-stretch overflow-hidden"
          style={{
            width: PRODUCT_THUMB_PX,
            minHeight: PRODUCT_THUMB_PX,
            borderRadius: PRODUCT_THUMB_RADIUS_PX,
          }}
        >
          <Image
            src={imageSrc}
            alt={item.title}
            fill
            className="object-cover"
            sizes={`${PRODUCT_THUMB_PX}px`}
          />
        </div>

        <div className="flex w-max min-w-0 max-w-full flex-1 flex-col justify-between gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="w-max min-w-0 max-w-full">
              <p
                className="line-clamp-2 w-max text-sm font-medium text-gray-900"
                style={{ maxWidth: PRODUCT_TITLE_MAX_PX }}
              >
                {item.title}
              </p>
              {item.modifierSummary ? (
                <p
                  className="mt-0.5 line-clamp-2 text-xs text-gray-500"
                  title={item.modifierSummary}
                >
                  {item.modifierSummary}
                </p>
              ) : null}
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {item.lineTotalFormatted}
              </p>
            </div>
            {canRemove ? (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label={removeItemLabel}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex h-6 min-w-[24px] shrink-0 items-center justify-center rounded-full border border-gray-200 bg-sky-50/70 px-2 text-[11px] font-semibold text-gray-900">
              ×{item.quantity}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
