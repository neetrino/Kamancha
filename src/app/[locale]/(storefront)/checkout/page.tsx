import { notFound, redirect } from "next/navigation";

import { cartLineUnitAmount } from "@/features/cart/domain/line-price";
import { getCartWithItems } from "@/features/cart/cart";
import { getUserBonusBalance } from "@/features/bonuses/application/queries";
import { getCheckoutOrderProducts } from "@/features/checkout/application/get-checkout-order-products";
import { getGroupOrderCheckoutUiFlags } from "@/features/checkout/application/group-order-checkout-context";
import { getGroupCartOverlay } from "@/features/group-orders/application/cart-overlay";
import { buildInvitePath } from "@/features/group-orders/application/money";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import { getDeliverySettings } from "@/features/delivery/application/get-delivery-settings";
import { listActiveCashChangeDenominations } from "@/features/delivery/domain/cash-change";
import { getDefaultShippingAddress } from "@/features/profile/application/address-queries";
import { resolveProductPrices } from "@/features/promotions/application/resolve-product-prices";
import { getStoreBonusSettings } from "@/features/settings/application/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { mediaPublicUrl } from "@/lib/media/public-url";

type CheckoutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const copy = dictionary.checkout;
  const groupBag = await getGroupCartOverlay();
  if (groupBag) {
    redirect(buildInvitePath(rawLocale, groupBag.inviteToken));
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
      items.map(({ product }) => ({
        id: product.id,
        priceAmount: product.priceAmount,
        compareAtAmount: product.compareAtAmount,
      })),
    ),
    user ? getUserBonusBalance(user.id) : Promise.resolve(null),
  ]);
  const orderProducts = await getCheckoutOrderProducts(
    rawLocale,
    items,
    prices,
  );
  const subtotal = items.reduce((sum, { item, product, modifiers }) => {
    const base = prices.get(product.id)?.unitAmount ?? product.priceAmount;
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

  return (
    <CheckoutForm
      locale={rawLocale}
      productsHref={`/${rawLocale}/products`}
      hasItems={items.length > 0}
      orderProducts={orderProducts}
      defaultFirstName={
        defaultAddress?.recipientFirstName ?? user?.firstName ?? ""
      }
      defaultLastName={
        defaultAddress?.recipientLastName ?? user?.lastName ?? ""
      }
      defaultEmail={user?.email ?? ""}
      defaultPhone={defaultAddress?.phone ?? user?.phone ?? ""}
      defaultLine1={
        groupCheckoutFlags.defaultDeliveryAddress ??
        defaultAddress?.line1 ??
        ""
      }
      subtotalAmount={subtotal}
      deliverySchedule={deliverySettings.schedule}
      cashChangeOptions={cashChangeOptions}
      splitOthersPrepaid={groupCheckoutFlags.splitOthersPrepaid}
      othersPrepaidAmount={groupCheckoutFlags.othersPrepaidAmount}
      lockedDeliveryAmount={groupCheckoutFlags.lockedDeliveryAmount}
      bonusAvailableBalance={bonusBalance}
      bonusMaxRedeemPercent={bonusSettings.maxRedeemPercent}
      bonusAccrualPercent={bonusSettings.accrualPercent}
      labels={{
        title: copy.title,
        productsInOrder: copy.productsInOrder,
        itemsOne: copy.itemsOne,
        itemsMany: copy.itemsMany,
        removeItem: copy.removeItem,
        contactInformation: copy.contactInformation,
        shippingAddress: copy.shippingAddress,
        paymentMethod: copy.paymentMethod,
        orderSummary: copy.orderSummary,
        firstName: copy.form.firstName,
        lastName: copy.form.lastName,
        email: copy.form.email,
        phone: copy.form.phone,
        address: copy.form.address,
        floor: copy.form.floor,
        intercomCode: copy.form.intercomCode,
        phonePlaceholder: copy.placeholders.phone,
        addressPlaceholder: copy.placeholders.address,
        floorPlaceholder: copy.placeholders.floor,
        intercomCodePlaceholder: copy.placeholders.intercomCode,
        openMap: copy.map.openMap,
        mapTitle: copy.map.title,
        mapHint: copy.map.hint,
        mapConfirm: copy.map.confirm,
        mapCancel: copy.map.cancel,
        mapResolving: copy.map.resolving,
        enterDeliveryAddress: copy.shipping.enterDeliveryAddress,
        calculatingDelivery: copy.shipping.calculatingDelivery,
        scheduleTitle: copy.schedule.title,
        schedulePickTime: copy.schedule.pickTime,
        scheduleNoSlots: copy.schedule.noSlots,
        schedulePrevMonth: copy.schedule.prevMonth,
        scheduleNextMonth: copy.schedule.nextMonth,
        selectDeliverySlot: copy.schedule.selectSlot,
        cashChangeTitle: copy.cashChange.title,
        cashChangeHint: copy.cashChange.hint,
        cashChangeNone: copy.cashChange.none,
        cashChangeDue: copy.cashChange.due,
        cashOnDelivery: copy.payment.cashOnDelivery,
        cashOnDeliveryDescription: copy.payment.cashOnDeliveryDescription,
        cashShort: copy.payment.cashShort,
        idram: copy.payment.idram,
        idramDescription: copy.payment.idramDescription,
        card: copy.payment.card,
        cardDescription: copy.payment.cardDescription,
        couponTitle: copy.coupon.title,
        couponPlaceholder: copy.coupon.placeholder,
        couponApply: copy.coupon.apply,
        couponApplying: copy.coupon.applying,
        giftCardTitle: copy.giftCard.title,
        giftCardPlaceholder: copy.giftCard.placeholder,
        giftCardApply: copy.giftCard.apply,
        giftCardApplying: copy.giftCard.applying,
        giftCardInitial: copy.giftCard.initial,
        giftCardUsed: copy.giftCard.used,
        giftCardRemaining: copy.giftCard.remaining,
        giftCardPayable: copy.giftCard.payable,
        giftCardApplied: copy.giftCard.applied,
        bonusTitle: copy.bonus.title,
        bonusAvailable: copy.bonus.available,
        bonusUse: copy.bonus.use,
        bonusAmount: copy.bonus.amount,
        bonusUseMax: copy.bonus.useMax,
        bonusApplied: copy.bonus.applied,
        bonusEarn: copy.bonus.earn,
        discount: copy.summary.discount,
        subtotal: copy.summary.subtotal,
        shipping: copy.summary.shipping,
        change: copy.summary.change,
        total: copy.summary.total,
        placeOrder: copy.buttons.placeOrder,
        processing: copy.buttons.processing,
        continueShopping: copy.buttons.continueShopping,
        cartEmpty: copy.errors.cartEmpty,
        groupPrepaidTitle: copy.groupPrepaid.title,
        groupPrepaidHint: copy.groupPrepaid.hint,
        groupPrepaidOthersPaid: copy.groupPrepaid.othersPaid,
        groupPrepaidYouPay: copy.groupPrepaid.youPay,
      }}
    />
  );
}
