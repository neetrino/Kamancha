"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";

import { BrandHeaderIcon } from "@/components/layout/BrandHeaderIcon";
import {
  SITE_HEADER_CART_BADGE,
  SITE_HEADER_CART_TRIGGER,
} from "@/components/layout/site-header-classes";

import { AppLink } from "@/components/ui/AppLink";
import { KamanchaPillButton } from "@/components/ui/KamanchaPillButton";
import { SideSheet, SIDE_SHEET_ANIMATION_MS } from "@/components/ui/SideSheet";
import { MobileCheckoutSheet } from "@/features/checkout/ui/MobileCheckoutSheet";
import type {
  CartDrawerItemView,
  CartDrawerView,
} from "@/features/cart/get-cart-drawer-view";
import { loadCartDrawerViewAction } from "@/features/cart/load-cart-drawer-view-action";
import {
  removeStorefrontCartItem,
  updateStorefrontCartItem,
} from "@/features/cart/storefront-cart-mutations";
import { showStorefrontAlert } from "@/features/storefront-chrome/storefront-alert-store";
import {
  adjustCartItemCount,
  revertCartItemCountAdjust,
  setCartItemCount,
  settleCartItemCountAdjust,
  useCartItemCount,
} from "@/features/storefront-chrome/storefront-counts-store";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { Currency } from "@/lib/money/currency";
import { storefrontProductImageSrc } from "@/lib/media/storefront-product-photo";
import { staticAssetUrl } from "@/lib/media/static-asset-url";
import { useIsXlDesktop } from "@/lib/react/use-is-xl-desktop";

const CART_PLUS_SRC = staticAssetUrl("/assets/brand/home/cart-plus.svg");

type CartDrawerTriggerArgs = {
  open: boolean;
  badgeCount: number;
  label: string;
  openDrawer: () => void;
  prefetchDrawerView: () => void;
};

type CartDrawerProps = {
  locale: Locale;
  currency: Currency;
  dictionary: Dictionary;
  itemCount: number;
  /** Custom trigger (e.g. mobile bottom nav). Defaults to header cart button. */
  renderTrigger?: (args: CartDrawerTriggerArgs) => React.ReactNode;
  /** Icon color on dark Kamancha header. */
  tone?: "default" | "onDark";
};

function formatItemCount(
  count: number,
  labels: Dictionary["cartDrawer"],
): string {
  if (count === 1) {
    return labels.itemsOne;
  }
  return labels.itemsMany.replace("{count}", String(count));
}

function withUpdatedQuantity(
  items: CartDrawerItemView[],
  itemId: string,
  quantity: number,
): CartDrawerItemView[] {
  if (quantity < 1) {
    return items.filter((item) => item.id !== itemId);
  }
  return items.map((item) =>
    item.id === itemId ? { ...item, quantity } : item,
  );
}

function recountItems(items: CartDrawerItemView[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function CartDrawer({
  locale,
  currency,
  dictionary,
  itemCount,
  renderTrigger,
  tone = "default",
}: CartDrawerProps) {
  const [open, setOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [view, setView] = useState<CartDrawerView | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [, startTransition] = useTransition();
  const labels = dictionary.cartDrawer;
  const isDesktop = useIsXlDesktop();
  const liveItemCount = useCartItemCount(itemCount);
  const badgeCount = liveItemCount;
  const hasItems = Boolean(view ? view.items.length > 0 : liveItemCount > 0);
  const canEdit = view?.canEdit ?? true;
  const checkoutHref = view?.checkoutHref ?? `/${locale}/checkout`;
  const checkoutLabel =
    view?.source === "group" ? labels.checkoutGroupOrder : labels.checkout;
  const useCheckoutPage = isDesktop !== false || view?.source === "group";

  function applyView(next: CartDrawerView): void {
    setView(next);
    setCartItemCount(next.itemCount);
  }

  function syncViewInBackground(): void {
    void loadCartDrawerViewAction(locale, currency)
      .then((next) => {
        applyView(next);
        settleCartItemCountAdjust();
      })
      .catch(() => {
        settleCartItemCountAdjust();
      });
  }

  function prefetchDrawerView(): void {
    if (view || loadingView || open) {
      return;
    }
    setLoadingView(true);
    startTransition(async () => {
      const next = await loadCartDrawerViewAction(locale, currency);
      applyView(next);
      setLoadingView(false);
    });
  }

  function openDrawer(): void {
    setOpen(true);
    setLoadingView(true);
    startTransition(async () => {
      const next = await loadCartDrawerViewAction(locale, currency);
      applyView(next);
      setLoadingView(false);
    });
  }

  function closeDrawer(): void {
    setOpen(false);
  }

  function openMobileCheckout(): void {
    closeDrawer();
    window.setTimeout(() => {
      setCheckoutOpen(true);
    }, SIDE_SHEET_ANIMATION_MS);
  }

  function changeQuantity(itemId: string, quantity: number): void {
    if (!view || !view.canEdit) return;
    const current = view.items.find((item) => item.id === itemId);
    if (!current) return;

    const nextQty = Math.max(0, quantity);
    const delta = nextQty - current.quantity;
    if (delta === 0) return;

    const nextItems = withUpdatedQuantity(view.items, itemId, nextQty);
    const nextCount = recountItems(nextItems);
    setView({
      ...view,
      items: nextItems,
      itemCount: nextCount,
    });
    adjustCartItemCount(delta);

    void updateStorefrontCartItem(itemId, nextQty)
      .then(() => {
        syncViewInBackground();
      })
      .catch((error: unknown) => {
        setView(view);
        revertCartItemCountAdjust(-delta);
        const message =
          error instanceof Error && error.message.length > 0
            ? error.message
            : dictionary.groupOrder.errorGeneric;
        showStorefrontAlert(message);
      });
  }

  function removeCartItem(itemId: string): void {
    if (!view || !view.canEdit) return;
    const current = view.items.find((item) => item.id === itemId);
    if (!current) return;

    const previous = view;
    const nextItems = view.items.filter((item) => item.id !== itemId);
    const nextCount = recountItems(nextItems);
    setView({
      ...view,
      items: nextItems,
      itemCount: nextCount,
    });
    adjustCartItemCount(-current.quantity);

    void removeStorefrontCartItem(itemId)
      .then(() => {
        syncViewInBackground();
      })
      .catch(() => {
        setView(previous);
        revertCartItemCountAdjust(current.quantity);
      });
  }

  return (
    <>
      <SideSheet
        open={open}
        onClose={closeDrawer}
        ariaLabel={labels.title}
        panelClassName="w-[87%] max-w-[420px]"
        surfaceClassName="rounded-l-[20px]"
        zIndexClassName="z-[200]"
        backdropBlur
        closeButtonClassName="side-sheet-close-stroke bg-[#335329] text-white hover:bg-[#2c4823]"
      >
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="font-big-fat-boii text-xl font-normal tracking-wide text-gray-900 uppercase">
            {labels.title}
          </h2>
          {hasItems ? (
            <p className="mt-1 text-sm text-gray-500">
              {formatItemCount(badgeCount, labels)}
            </p>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {loadingView && !view ? (
            <div className="space-y-3">
              <div className="h-24 animate-pulse rounded-[20px] bg-gray-100" />
              <div className="h-24 animate-pulse rounded-[20px] bg-gray-100" />
            </div>
          ) : !view || view.items.length === 0 ? (
            <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center text-center">
              <div className="flex size-20 items-center justify-center rounded-full bg-brand-forest">
                <Image
                  src={CART_PLUS_SRC}
                  alt=""
                  width={48}
                  height={42}
                  className="h-[42px] w-[48px] translate-y-[2px]"
                  aria-hidden
                />
              </div>
              <p className="mt-5 text-xl font-bold text-gray-900">
                {labels.empty}
              </p>
              <p className="mt-2 max-w-[20rem] text-sm leading-relaxed text-gray-500">
                {labels.emptyDescription}
              </p>
              <KamanchaPillButton
                href={`/${locale}/products`}
                label={labels.emptyCta}
                variant="dark"
                className="mt-6"
                onClick={closeDrawer}
              />
            </div>
          ) : (
            <ul className="space-y-3">
              {view.items.map((item) => {
                const productHref =
                  typeof item.href === "string" && item.href.length > 0
                    ? item.href
                    : null;
                const imageSrc = storefrontProductImageSrc(item.imageUrl);

                return (
                  <li
                    key={item.id}
                    className="relative isolate overflow-hidden rounded-[20px] border border-gray-200 bg-white px-3 py-3.5"
                  >
                    <button
                      type="button"
                      onClick={() => removeCartItem(item.id)}
                      disabled={!canEdit}
                      className="absolute top-2 right-2 z-[3] flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={labels.removeItem}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>

                    <div className="relative z-[2] flex items-stretch gap-3 pr-7">
                      {productHref ? (
                        <AppLink
                          href={productHref}
                          prefetchPolicy="intent"
                          onClick={closeDrawer}
                          className="relative size-16 shrink-0 overflow-hidden rounded-[12px]"
                        >
                          <Image
                            src={imageSrc}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </AppLink>
                      ) : (
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-[12px]">
                          <Image
                            src={imageSrc}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="flex min-h-16 min-w-0 flex-1 flex-col justify-between gap-1">
                        <div className="min-w-0">
                          {productHref ? (
                            <AppLink
                              href={productHref}
                              prefetchPolicy="intent"
                              onClick={closeDrawer}
                              className="block truncate text-sm font-medium leading-5 text-gray-900 transition-colors hover:text-gray-600"
                            >
                              {item.title}
                            </AppLink>
                          ) : (
                            <p className="truncate text-sm font-medium leading-5 text-gray-900">
                              {item.title}
                            </p>
                          )}
                        </div>
                        <div className="min-w-0">
                          {item.modifierSummary ? (
                            <p
                              className="mb-0.5 truncate text-xs text-gray-500"
                              title={item.modifierSummary}
                            >
                              {item.modifierSummary}
                            </p>
                          ) : null}
                          <div className="flex items-center justify-between gap-2">
                            <p className="min-w-0 truncate text-sm font-semibold text-gray-900">
                              {item.lineTotalFormatted}
                            </p>
                            <div className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-gray-200 bg-sky-50/70 px-0.5 py-0.5">
                              <button
                                type="button"
                                onClick={() =>
                                  changeQuantity(item.id, item.quantity - 1)
                                }
                                disabled={!canEdit}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={labels.decreaseQuantity}
                              >
                                <Minus className="h-3 w-3" aria-hidden />
                              </button>
                              <span className="min-w-5 text-center text-[11px] font-semibold tabular-nums text-gray-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  changeQuantity(item.id, item.quantity + 1)
                                }
                                disabled={!canEdit}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={labels.increaseQuantity}
                              >
                                <Plus className="h-3 w-3" aria-hidden />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <dl className="text-sm">
            <div className="flex items-center justify-between text-base font-bold text-gray-900">
              <dt>{labels.total}</dt>
              <dd className="tabular-nums">{view?.totalFormatted ?? "—"}</dd>
            </div>
          </dl>

          {hasItems ? (
            <KamanchaPillButton
              href={useCheckoutPage ? checkoutHref : undefined}
              label={checkoutLabel}
              variant="dark"
              className="kamancha-pill-button--cart-cta kamancha-pill-button--sheet-cta mt-5 max-w-none sm:max-w-none"
              onClick={useCheckoutPage ? closeDrawer : openMobileCheckout}
            />
          ) : null}
        </div>
      </SideSheet>

      <MobileCheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        locale={locale}
        dictionary={dictionary}
      />

      {renderTrigger ? (
        renderTrigger({
          open,
          badgeCount,
          label: dictionary.nav.cart,
          openDrawer,
          prefetchDrawerView,
        })
      ) : (
        <button
          type="button"
          data-cart-fly-target
          onClick={openDrawer}
          onPointerEnter={prefetchDrawerView}
          onFocus={prefetchDrawerView}
          className={
            tone === "onDark"
              ? SITE_HEADER_CART_TRIGGER
              : "inline-flex h-11 items-center gap-1 rounded-lg px-1 text-gray-700 transition-colors hover:text-gray-900"
          }
          aria-label={dictionary.nav.cart}
          aria-expanded={open}
        >
          {tone === "onDark" ? (
            <>
              <span className="pointer-events-none absolute inset-0 inline-flex items-center justify-center">
                <BrandHeaderIcon name="cart" size={26} />
              </span>
              {badgeCount > 0 ? (
                <span className={SITE_HEADER_CART_BADGE}>
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </>
          ) : (
            <span className="relative inline-flex h-11 w-11 items-center justify-center">
              <ShoppingCart className="h-5 w-5" aria-hidden="true" />
              {badgeCount > 0 ? (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
            </span>
          )}
        </button>
      )}
    </>
  );
}
