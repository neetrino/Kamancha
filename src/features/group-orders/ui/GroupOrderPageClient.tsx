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

import { AppLink } from "@/components/ui/AppLink";
import { AddressAutocomplete } from "@/components/ui/AddressAutocomplete";
import { AddressMapPicker } from "@/components/ui/AddressMapPicker";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
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
import type { GroupOrderDetailView } from "@/features/group-orders/application/queries";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

const GLASS_PILL_BUTTON =
  "liquid-glass isolate inline-flex items-center justify-center overflow-hidden rounded-full px-4 py-2 text-sm font-semibold text-gray-900 disabled:cursor-not-allowed disabled:opacity-50";

const PILL_FULL = "max-w-none sm:max-w-none";

const BLOCK_TITLE =
  "font-big-fat-boii text-base font-normal tracking-wide text-black uppercase";

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
    <div className={`mx-auto max-w-2xl px-4 py-8 ${pending ? "opacity-70" : ""}`}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-big-fat-boii text-2xl font-normal tracking-wide text-white uppercase">
            {labels.manageTitle}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {labels.status}: {view.status}
          </p>
        </div>
        <AppLink
          href={`/${locale}/products`}
          prefetchPolicy="intent"
          className="text-sm font-medium text-white/80 underline-offset-2 hover:underline"
        >
          {labels.browseMenu}
        </AppLink>
      </div>

      <section className="mb-6 liquid-glass isolate overflow-hidden rounded-3xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={BLOCK_TITLE}>{labels.inviteLink}</p>
            <p className="mt-1 truncate text-xs text-gray-500">
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

      <section className="mb-6 space-y-2 liquid-glass isolate overflow-hidden rounded-3xl p-4 text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 shrink-0 text-black" aria-hidden />
          <p className={BLOCK_TITLE}>
            {view.paymentMode === "ORGANIZER_PAYS_ALL"
              ? labels.payingOrganizer.replace(
                  "{name}",
                  view.organizerDisplayName,
                )
              : labels.payingSplit}
          </p>
        </div>
        <p className="text-white">
          {view.spendLimitFormatted
            ? labels.limitLabel.replace("{amount}", view.spendLimitFormatted)
            : labels.noLimit}
        </p>
        <p className="text-white">
          {view.deliveryAddress
            ? `${labels.deliveryAddressLabel}: ${view.deliveryAddress}`
            : labels.noDeliveryAddress}
        </p>
        <p className="text-white">
          {labels.delivery}: {view.deliveryFormatted}
          {view.deliveryDistanceLabel
            ? ` · ${view.deliveryDistanceLabel}`
            : ""}
        </p>
        {view.paymentMode === "SPLIT_PER_PARTICIPANT" &&
        view.currentParticipantId &&
        currentParticipant ? (
          <p className="text-white">
            {labels.yourDeliveryShare}:{" "}
            {currentParticipant.deliveryShareFormatted}
          </p>
        ) : null}
        <p className="font-semibold text-white">
          {labels.total}: {view.grandTotalFormatted}
        </p>
      </section>

      {isOrganizer && canEdit ? (
        <section className="mb-6 space-y-5 liquid-glass isolate overflow-hidden rounded-3xl p-4">
          <h2 className={BLOCK_TITLE}>{labels.settingsTitle}</h2>

          <div className="space-y-2">
            <label className="block">
              <span className={BLOCK_TITLE}>{labels.spendLimitFieldLabel}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
                {labels.spendLimitFieldHint}
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[8rem] flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
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
                className={GLASS_PILL_BUTTON}
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

          <div className="space-y-2 border-t border-gray-100 pt-4">
            <label className="block">
              <span className={BLOCK_TITLE}>{labels.deliveryFieldLabel}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-gray-500">
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
            <p className="text-xs leading-relaxed text-gray-500">
              {view.paymentMode === "SPLIT_PER_PARTICIPANT"
                ? labels.deliverySplitHint
                : labels.deliveryOrganizerPaysHint}
            </p>
            {view.deliveryAmount > 0 ? (
              <p className="text-sm font-medium text-emerald-700">
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

          <div className="space-y-2 border-t border-gray-100 pt-4">
            <p className="text-xs leading-relaxed text-gray-500">
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
        </section>
      ) : null}

      <section className="mb-6">
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
                      <span className="ml-2 text-xs font-normal text-black">
                        ({labels.organizer})
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-600">
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
                    <p className="mt-0.5 text-xs text-gray-500">
                      {labels.deliveryShare}:{" "}
                      {participant.deliveryShareFormatted} · {labels.total}:{" "}
                      {participant.finalAmountFormatted}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <p
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      participant.itemsReady
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {participant.itemsReady ? labels.ready : labels.notReady}
                  </p>
                  {isOrganizer &&
                  participant.role !== "ORGANIZER" &&
                  canEdit ? (
                    <button
                      type="button"
                      className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                      aria-label={labels.removeParticipant}
                      onClick={() =>
                        run(async () =>
                          removeParticipantAction({
                            inviteToken,
                            participantId: participant.id,
                          }),
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </div>

              {participant.items.length === 0 ? (
                <p className="mt-3 text-sm text-gray-400">{labels.emptyItems}</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {participant.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl bg-gray-50 p-2"
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-white">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-contain p-0.5"
                            sizes="48px"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.title} × {item.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.lineTotalFormatted}
                        </p>
                      </div>
                      {(isOrganizer ||
                        participant.id === view.currentParticipantId) &&
                      canEdit ? (
                        <button
                          type="button"
                          className="rounded-full p-1.5 text-gray-400 hover:bg-white hover:text-gray-700"
                          aria-label={labels.removeItem}
                          onClick={() =>
                            run(async () =>
                              removeGroupOrderItemAction({
                                inviteToken,
                                itemId: item.id,
                              }),
                            )
                          }
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </section>

      {error ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-4 space-y-3">
        {canEdit && view.currentParticipantId ? (
          iAmReady ? (
            <div
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center"
              role="status"
            >
              <p className="text-sm font-semibold text-emerald-800">
                {labels.itemsReadyDone}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-700/90">
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
                  const result = await markItemsReadyAction({ inviteToken });
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
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-900">
            {labels.payYouPaid}
          </p>
        ) : null}

        {isOrganizer && view.status === "AWAITING_PAYMENTS" ? (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
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
            onClick={() =>
              run(async () => cancelGroupOrderAction({ inviteToken }))
            }
          />
        ) : null}
      </div>
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
        <p className="mt-2 text-sm text-gray-500">{labels.joinDescription}</p>

        <div className="mt-5 space-y-3 text-sm text-gray-800">
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
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-gray-400"
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
