import Image from "next/image";

import type { CheckoutPaymentMethod } from "@/features/checkout/domain/payment-methods";
import { CheckoutPaymentBadge } from "@/features/checkout/ui/CheckoutPaymentBadge";
import {
  CHECKOUT_CARD_PAYMENT_BADGES,
  CHECKOUT_PAYMENT_CARD_ART_HEIGHT_DESKTOP_PX,
  CHECKOUT_PAYMENT_CARD_ART_HEIGHT_MOBILE_PX,
  getCheckoutCardBadgeUniformBoxSize,
  CHECKOUT_PAYMENT_CARD_BADGE_ORDER,
  CHECKOUT_PAYMENT_CARD_BADGE_RADIUS_MOBILE_PX,
  CHECKOUT_PAYMENT_CARD_BADGES_GAP_MOBILE_PX,
  CHECKOUT_PAYMENT_CARD_BADGES_GAP_PX,
  CHECKOUT_PAYMENT_CASH_ICON_SIZE_DESKTOP_PX,
  CHECKOUT_PAYMENT_CASH_ICON_SIZE_MOBILE_PX,
  CHECKOUT_PAYMENT_CASH_SRC,
  CHECKOUT_PAYMENT_ICON_BOX_HEIGHT_PX,
  CHECKOUT_PAYMENT_ICON_BOX_RADIUS_PX,
  CHECKOUT_PAYMENT_IDRAM_BOX_HEIGHT_MOBILE_PX,
  CHECKOUT_PAYMENT_IDRAM_BOX_WIDTH_MOBILE_PX,
  CHECKOUT_PAYMENT_IDRAM_BOX_WIDTH_PX,
  CHECKOUT_PAYMENT_IDRAM_LOGO_DISPLAY_HEIGHT_MOBILE_PX,
  CHECKOUT_PAYMENT_IDRAM_LOGO_DISPLAY_HEIGHT_PX,
  CHECKOUT_PAYMENT_IDRAM_LOGO_HEIGHT_PX,
  CHECKOUT_PAYMENT_IDRAM_SRC,
  CHECKOUT_PAYMENT_TERMINAL_ICON_SIZE_DESKTOP_PX,
  CHECKOUT_PAYMENT_TERMINAL_ICON_SIZE_MOBILE_PX,
  CHECKOUT_PAYMENT_TERMINAL_SRC,
  CHECKOUT_PAYMENT_IDRAM_LOGO_WIDTH_PX,
} from "@/features/checkout/ui/checkout-payment-assets";

function getCheckoutCardBadges() {
  return CHECKOUT_PAYMENT_CARD_BADGE_ORDER.map((alt) =>
    CHECKOUT_CARD_PAYMENT_BADGES.find((badge) => badge.alt === alt),
  ).filter(
    (badge): badge is (typeof CHECKOUT_CARD_PAYMENT_BADGES)[number] =>
      badge !== undefined,
  );
}

function CheckoutTerminalIcon({ sizePx }: { sizePx: number }) {
  return (
    <Image
      src={CHECKOUT_PAYMENT_TERMINAL_SRC}
      alt=""
      width={640}
      height={612}
      unoptimized
      priority
      className="w-auto object-contain object-center"
      style={{ height: sizePx }}
    />
  );
}

function CheckoutCashIcon({ sizePx }: { sizePx: number }) {
  return (
    <Image
      src={CHECKOUT_PAYMENT_CASH_SRC}
      alt=""
      width={640}
      height={567}
      unoptimized
      className="w-auto object-contain object-center"
      style={{ height: sizePx }}
    />
  );
}

type CheckoutPaymentMethodIconsProps = {
  methodId: CheckoutPaymentMethod;
  /** Use checkout desktop badge sizing at all breakpoints (group-order pay). */
  cardBadgeSize?: "mobile" | "desktop";
};

export function CheckoutPaymentMethodIcons({
  methodId,
  cardBadgeSize = "mobile",
}: CheckoutPaymentMethodIconsProps) {
  if (methodId === "cash_on_delivery") {
    return (
      <>
        <div className="flex shrink-0 items-center justify-center xl:hidden">
          <CheckoutCashIcon sizePx={CHECKOUT_PAYMENT_CASH_ICON_SIZE_MOBILE_PX} />
        </div>
        <div className="hidden shrink-0 items-center justify-center xl:flex">
          <CheckoutCashIcon sizePx={CHECKOUT_PAYMENT_CASH_ICON_SIZE_DESKTOP_PX} />
        </div>
      </>
    );
  }

  if (methodId === "terminal") {
    return (
      <>
        <div className="flex shrink-0 items-center justify-center xl:hidden">
          <CheckoutTerminalIcon
            sizePx={CHECKOUT_PAYMENT_TERMINAL_ICON_SIZE_MOBILE_PX}
          />
        </div>
        <div className="hidden shrink-0 items-center justify-center xl:flex">
          <CheckoutTerminalIcon
            sizePx={CHECKOUT_PAYMENT_TERMINAL_ICON_SIZE_DESKTOP_PX}
          />
        </div>
      </>
    );
  }

  if (methodId === "idram") {
    return (
      <>
        <div
          className="relative flex shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-white px-1.5 xl:hidden"
          style={{
            width: CHECKOUT_PAYMENT_IDRAM_BOX_WIDTH_MOBILE_PX,
            height: CHECKOUT_PAYMENT_IDRAM_BOX_HEIGHT_MOBILE_PX,
            borderRadius: CHECKOUT_PAYMENT_ICON_BOX_RADIUS_PX,
          }}
        >
          <Image
            src={CHECKOUT_PAYMENT_IDRAM_SRC}
            alt="Idram"
            width={CHECKOUT_PAYMENT_IDRAM_LOGO_WIDTH_PX}
            height={CHECKOUT_PAYMENT_IDRAM_LOGO_HEIGHT_PX}
            className="w-auto object-contain object-center"
            style={{ height: CHECKOUT_PAYMENT_IDRAM_LOGO_DISPLAY_HEIGHT_MOBILE_PX }}
          />
        </div>
        <div
          className="relative hidden shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-white px-2 xl:flex"
          style={{
            width: CHECKOUT_PAYMENT_IDRAM_BOX_WIDTH_PX,
            height: CHECKOUT_PAYMENT_ICON_BOX_HEIGHT_PX,
            borderRadius: CHECKOUT_PAYMENT_ICON_BOX_RADIUS_PX,
          }}
        >
          <Image
            src={CHECKOUT_PAYMENT_IDRAM_SRC}
            alt="Idram"
            width={CHECKOUT_PAYMENT_IDRAM_LOGO_WIDTH_PX}
            height={CHECKOUT_PAYMENT_IDRAM_LOGO_HEIGHT_PX}
            className="w-auto object-contain object-center"
            style={{ height: CHECKOUT_PAYMENT_IDRAM_LOGO_DISPLAY_HEIGHT_PX }}
          />
        </div>
      </>
    );
  }

  return (
    <CheckoutCardPaymentBadges
      size={cardBadgeSize === "desktop" ? "desktop" : "responsive"}
    />
  );
}

function CheckoutCardPaymentBadges({
  size = "responsive",
}: {
  size?: "responsive" | "desktop";
}) {
  const badges = getCheckoutCardBadges();
  const desktopBadges = (
    <div
      className={
        size === "desktop"
          ? "flex w-full max-w-full flex-nowrap items-center justify-start"
          : "hidden shrink-0 flex-nowrap items-center justify-start xl:flex"
      }
      style={{ gap: CHECKOUT_PAYMENT_CARD_BADGES_GAP_PX }}
    >
      {badges.map((badge) => (
        <CheckoutPaymentBadge
          key={badge.alt}
          badge={badge}
          logoHeightPx={CHECKOUT_PAYMENT_CARD_ART_HEIGHT_DESKTOP_PX}
          radiusPx={CHECKOUT_PAYMENT_ICON_BOX_RADIUS_PX}
          paddingPx={0}
          boxSize={getCheckoutCardBadgeUniformBoxSize(
            CHECKOUT_PAYMENT_CARD_ART_HEIGHT_DESKTOP_PX,
          )}
        />
      ))}
    </div>
  );

  if (size === "desktop") {
    return desktopBadges;
  }

  return (
    <>
      <div
        className="flex max-w-full flex-wrap items-center justify-start self-start xl:hidden"
        style={{ gap: CHECKOUT_PAYMENT_CARD_BADGES_GAP_MOBILE_PX }}
      >
        {badges.map((badge) => (
          <CheckoutPaymentBadge
            key={badge.alt}
            badge={badge}
            logoHeightPx={CHECKOUT_PAYMENT_CARD_ART_HEIGHT_MOBILE_PX}
            radiusPx={CHECKOUT_PAYMENT_CARD_BADGE_RADIUS_MOBILE_PX}
            paddingPx={0}
            boxSize={getCheckoutCardBadgeUniformBoxSize(
              CHECKOUT_PAYMENT_CARD_ART_HEIGHT_MOBILE_PX,
            )}
          />
        ))}
      </div>
      {desktopBadges}
    </>
  );
}
