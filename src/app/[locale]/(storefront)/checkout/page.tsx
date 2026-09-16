import { notFound, redirect } from "next/navigation";

import { getCheckoutFormView } from "@/features/checkout/application/get-checkout-form-view";
import { CheckoutForm } from "@/features/checkout/ui/CheckoutForm";
import { checkoutFormLabels } from "@/features/checkout/ui/checkout-form-labels";
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

  const loaded = await getCheckoutFormView(rawLocale);
  if (!loaded.ok) {
    redirect(loaded.redirectTo);
  }

  const dictionary = getDictionary(rawLocale);
  const view = loaded.view;

  return (
    <CheckoutForm
      locale={rawLocale}
      labels={checkoutFormLabels(dictionary.checkout)}
      productsHref={view.productsHref}
      hasItems={view.hasItems}
      orderProducts={view.orderProducts}
      defaultFirstName={view.defaultFirstName}
      defaultLastName={view.defaultLastName}
      defaultEmail={view.defaultEmail}
      defaultPhone={view.defaultPhone}
      defaultLine1={view.defaultLine1}
      subtotalAmount={view.subtotalAmount}
      deliverySchedule={view.deliverySchedule}
      cashChangeOptions={view.cashChangeOptions}
      splitOthersPrepaid={view.splitOthersPrepaid}
      othersPrepaidAmount={view.othersPrepaidAmount}
      lockedDeliveryAmount={view.lockedDeliveryAmount}
      bonusAvailableBalance={view.bonusAvailableBalance}
      bonusMaxRedeemPercent={view.bonusMaxRedeemPercent}
      bonusAccrualPercent={view.bonusAccrualPercent}
    />
  );
}
