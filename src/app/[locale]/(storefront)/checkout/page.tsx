import { notFound } from "next/navigation";

import { cartLineUnitAmount } from "@/features/cart/domain/line-price";
import { getCartWithItems } from "@/features/cart/cart";
import { getCheckoutOrderProducts } from "@/features/checkout/application/get-checkout-order-products";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import { isCheckoutDistanceDeliveryEnabled } from "@/features/delivery/application/get-delivery-settings";
import { getDefaultShippingAddress } from "@/features/profile/application/address-queries";
import { resolveProductPrices } from "@/features/promotions/application/resolve-product-prices";
import { getCurrentUser } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

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
  const [user, { items }, deliveryEnabled] = await Promise.all([
    getCurrentUser(),
    getCartWithItems(),
    isCheckoutDistanceDeliveryEnabled(),
  ]);
  const [defaultAddress, prices, orderProducts] = await Promise.all([
    user ? getDefaultShippingAddress(user.id) : Promise.resolve(null),
    resolveProductPrices(
      items.map(({ product }) => ({
        id: product.id,
        priceAmount: product.priceAmount,
        compareAtAmount: product.compareAtAmount,
      })),
    ),
    getCheckoutOrderProducts(rawLocale, items),
  ]);
  const subtotal = items.reduce((sum, { item, product, modifiers }) => {
    const base = prices.get(product.id)?.unitAmount ?? product.priceAmount;
    return sum + item.quantity * cartLineUnitAmount(base, modifiers);
  }, 0);

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
      defaultLine1={defaultAddress?.line1 ?? ""}
      subtotalAmount={subtotal}
      deliveryEnabled={deliveryEnabled}
      labels={{
        title: copy.title,
        productsInOrder: copy.productsInOrder,
        itemsOne: copy.itemsOne,
        itemsMany: copy.itemsMany,
        removeItem: copy.removeItem,
        contactInformation: copy.contactInformation,
        shippingMethod: copy.shippingMethod,
        shippingAddress: copy.shippingAddress,
        paymentMethod: copy.paymentMethod,
        orderSummary: copy.orderSummary,
        firstName: copy.form.firstName,
        lastName: copy.form.lastName,
        email: copy.form.email,
        phone: copy.form.phone,
        address: copy.form.address,
        phonePlaceholder: copy.placeholders.phone,
        addressPlaceholder: copy.placeholders.address,
        storePickup: copy.shipping.storePickup,
        storePickupDescription: copy.shipping.storePickupDescription,
        delivery: copy.shipping.delivery,
        deliveryDescription: copy.shipping.deliveryDescription,
        freePickup: copy.shipping.freePickup,
        enterDeliveryAddress: copy.shipping.enterDeliveryAddress,
        calculatingDelivery: copy.shipping.calculatingDelivery,
        cashOnDelivery: copy.payment.cashOnDelivery,
        cashOnDeliveryDescription: copy.payment.cashOnDeliveryDescription,
        idram: copy.payment.idram,
        idramDescription: copy.payment.idramDescription,
        arca: copy.payment.arca,
        arcaDescription: copy.payment.arcaDescription,
        couponTitle: copy.coupon.title,
        couponPlaceholder: copy.coupon.placeholder,
        couponApply: copy.coupon.apply,
        couponApplying: copy.coupon.applying,
        discount: copy.summary.discount,
        subtotal: copy.summary.subtotal,
        shipping: copy.summary.shipping,
        tax: copy.summary.tax,
        total: copy.summary.total,
        placeOrder: copy.buttons.placeOrder,
        processing: copy.buttons.processing,
        continueShopping: copy.buttons.continueShopping,
        cartEmpty: copy.errors.cartEmpty,
      }}
    />
  );
}
