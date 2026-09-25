import "server-only";

import { getUserBonusBalance } from "@/features/bonuses/application/queries";
import { getCartWithItems } from "@/features/cart/cart";
import { cartLineUnitAmount } from "@/features/cart/domain/line-price";
import { getCheckoutOrderProducts } from "@/features/checkout/application/get-checkout-order-products";
import { getGroupOrderCheckoutUiFlags } from "@/features/checkout/application/group-order-checkout-context";
import type { CheckoutOrderProduct } from "@/features/checkout/ui/checkout-order-product";
import { getDeliverySettings } from "@/features/delivery/application/get-delivery-settings";
import {
  listActiveCashChangeDenominations,
  type CashChangeDenominationView,
} from "@/features/delivery/domain/cash-change";
import type { DeliveryScheduleSettings } from "@/features/delivery/domain/delivery-schedule";
import { getGroupCartOverlay } from "@/features/group-orders/application/cart-overlay";
import { buildInvitePath } from "@/features/group-orders/application/money";
import { getDefaultShippingAddress } from "@/features/profile/application/address-queries";
import {
  pricedCartLineInput,
  resolveProductPrices,
} from "@/features/promotions/application/resolve-product-prices";
import { getStoreBonusSettings } from "@/features/settings/application/queries";
import { getCurrentUser } from "@/lib/auth/session";
import type { Locale } from "@/lib/i18n/config";
import { mediaPublicUrl } from "@/lib/media/public-url";

export type CheckoutFormView = {
  productsHref: string;
  hasItems: boolean;
  orderProducts: CheckoutOrderProduct[];
  defaultFirstName: string;
  defaultLastName: string;
  defaultEmail: string;
  defaultPhone: string;
  defaultLine1: string;
  subtotalAmount: number;
  deliverySchedule: DeliveryScheduleSettings;
  cashChangeOptions: CashChangeDenominationView[];
  bonusAvailableBalance: number | null;
  bonusMaxRedeemPercent: number;
  bonusAccrualPercent: number;
  splitOthersPrepaid: boolean;
  othersPrepaidAmount: number;
  lockedDeliveryAmount: number | null;
};

export type GetCheckoutFormViewResult =
  | { ok: true; view: CheckoutFormView }
  | { ok: false; redirectTo: string };

/** Shared checkout payload for the page and the mobile cart sheet. */
export async function getCheckoutFormView(
  locale: Locale,
): Promise<GetCheckoutFormViewResult> {
  const groupBag = await getGroupCartOverlay();
  if (groupBag) {
    return {
      ok: false,
      redirectTo: buildInvitePath(locale, groupBag.inviteToken),
    };
  }

  const [user, { items }, deliverySettings, bonusSettings, groupCheckoutFlags] =
    await Promise.all([
      getCurrentUser(),
      getCartWithItems(),
      getDeliverySettings(),
      getStoreBonusSettings(),
      getGroupOrderCheckoutUiFlags(),
    ]);
  const [defaultAddress, prices, bonusBalance] = await Promise.all([
    user ? getDefaultShippingAddress(user.id) : Promise.resolve(null),
    resolveProductPrices(
      items.map(({ item, product, variant }) =>
        pricedCartLineInput({
          itemId: item.id,
          productId: product.id,
          productPriceAmount: product.priceAmount,
          compareAtAmount: product.compareAtAmount,
          variantPriceAmount: variant?.priceAmount ?? null,
        }),
      ),
    ),
    user ? getUserBonusBalance(user.id) : Promise.resolve(null),
  ]);
  const orderProducts = await getCheckoutOrderProducts(
    locale,
    items,
    prices,
  );
  const subtotal = items.reduce((sum, { item, product, modifiers, variant }) => {
    const fallback = variant?.priceAmount ?? product.priceAmount;
    const base = prices.get(item.id)?.unitAmount ?? fallback;
    return sum + item.quantity * cartLineUnitAmount(base, modifiers);
  }, 0);

  const cashChangeOptions = listActiveCashChangeDenominations(
    deliverySettings.cashChangeDenominations,
  ).map((item) => ({
    id: item.id,
    amount: item.amount,
    imageUrl: item.imageObjectKey
      ? mediaPublicUrl(item.imageObjectKey)
      : null,
  }));

  return {
    ok: true,
    view: {
      productsHref: `/${locale}/products`,
      hasItems: items.length > 0,
      orderProducts,
      defaultFirstName:
        defaultAddress?.recipientFirstName ?? user?.firstName ?? "",
      defaultLastName:
        defaultAddress?.recipientLastName ?? user?.lastName ?? "",
      defaultEmail: user?.email ?? "",
      defaultPhone: defaultAddress?.phone ?? user?.phone ?? "",
      defaultLine1:
        groupCheckoutFlags.defaultDeliveryAddress ??
        defaultAddress?.line1 ??
        "",
      subtotalAmount: subtotal,
      deliverySchedule: deliverySettings.schedule,
      cashChangeOptions,
      bonusAvailableBalance: bonusBalance,
      bonusMaxRedeemPercent: bonusSettings.maxRedeemPercent,
      bonusAccrualPercent: bonusSettings.accrualPercent,
      splitOthersPrepaid: groupCheckoutFlags.splitOthersPrepaid,
      othersPrepaidAmount: groupCheckoutFlags.othersPrepaidAmount,
      lockedDeliveryAmount: groupCheckoutFlags.lockedDeliveryAmount,
    },
  };
}
