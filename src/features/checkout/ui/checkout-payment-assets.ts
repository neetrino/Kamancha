/** Checkout payment logos and badge geometry (MaMarie checkout). */

export const CHECKOUT_PAYMENT_VISA_SRC = "/assets/payments/checkout/visa.webp";
export const CHECKOUT_PAYMENT_MASTERCARD_SRC =
  "/assets/payments/checkout/mastercard.webp";
export const CHECKOUT_PAYMENT_ARCA_SRC = "/assets/payments/checkout/arca.webp";
export const CHECKOUT_PAYMENT_IDRAM_SRC = "/assets/payments/checkout/idram.webp";

export const CHECKOUT_PAYMENT_OPTION_SELECTED_CLASS =
  "border-brand-forest bg-brand-forest/10";
export const CHECKOUT_PAYMENT_OPTION_DEFAULT_CLASS =
  "border-gray-200 hover:bg-gray-50/80";
export const CHECKOUT_PAYMENT_OPTION_BASE_CLASS =
  "flex cursor-pointer items-center rounded-[15px] border-2 p-4 outline-none transition-all [-webkit-tap-highlight-color:transparent] focus-within:outline-none focus-within:ring-0";

export const CHECKOUT_PAYMENT_ICON_BOX_HEIGHT_PX = 40;
export const CHECKOUT_PAYMENT_ICON_BOX_RADIUS_PX = 8;
export const CHECKOUT_PAYMENT_CARD_BADGES_GAP_PX = 8;

export const CHECKOUT_PAYMENT_CARD_BADGE_BOX_HEIGHT_PX =
  CHECKOUT_PAYMENT_ICON_BOX_HEIGHT_PX;
export const CHECKOUT_PAYMENT_CARD_BADGE_PADDING_PX = 8;
export const CHECKOUT_PAYMENT_CARD_BADGE_LOGO_HEIGHT_PX =
  CHECKOUT_PAYMENT_CARD_BADGE_BOX_HEIGHT_PX -
  CHECKOUT_PAYMENT_CARD_BADGE_PADDING_PX * 2;

export const CHECKOUT_PAYMENT_IDRAM_BOX_HEIGHT_MOBILE_PX = 40;
export const CHECKOUT_PAYMENT_CARD_BADGE_PADDING_MOBILE_PX = 4;
export const CHECKOUT_PAYMENT_CARD_BADGE_BOX_HEIGHT_MOBILE_PX = 30;
export const CHECKOUT_PAYMENT_CARD_BADGE_LOGO_HEIGHT_MOBILE_PX =
  CHECKOUT_PAYMENT_CARD_BADGE_BOX_HEIGHT_MOBILE_PX -
  CHECKOUT_PAYMENT_CARD_BADGE_PADDING_MOBILE_PX * 2;
export const CHECKOUT_PAYMENT_CARD_BADGE_RADIUS_MOBILE_PX = 5;
export const CHECKOUT_PAYMENT_CARD_BADGES_GAP_MOBILE_PX = 4;
export const CHECKOUT_PAYMENT_CARD_BADGE_ORDER = [
  "Visa",
  "Mastercard",
  "ArCa",
] as const;

export const CHECKOUT_PAYMENT_VISA_INNER_LOGO_SCALE = 0.9;
export const CHECKOUT_PAYMENT_ARCA_INNER_LOGO_SCALE = 3.5;
export const CHECKOUT_PAYMENT_MASTERCARD_INNER_LOGO_SCALE = 1.25;

export type CheckoutCardPaymentBadgeAlt =
  (typeof CHECKOUT_PAYMENT_CARD_BADGE_ORDER)[number];

export type CheckoutCardPaymentBadge = {
  alt: CheckoutCardPaymentBadgeAlt;
  src: string;
  sourceWidthPx: number;
  sourceHeightPx: number;
  innerLogoScale?: number;
};

export type CheckoutCardBadgeFramedBoxSize = {
  widthPx: number;
  heightPx: number;
};

export const CHECKOUT_CARD_PAYMENT_BADGES: CheckoutCardPaymentBadge[] = [
  {
    alt: "Visa",
    src: CHECKOUT_PAYMENT_VISA_SRC,
    sourceWidthPx: 640,
    sourceHeightPx: 207,
    innerLogoScale: CHECKOUT_PAYMENT_VISA_INNER_LOGO_SCALE,
  },
  {
    alt: "Mastercard",
    src: CHECKOUT_PAYMENT_MASTERCARD_SRC,
    sourceWidthPx: 567,
    sourceHeightPx: 440,
    innerLogoScale: CHECKOUT_PAYMENT_MASTERCARD_INNER_LOGO_SCALE,
  },
  {
    alt: "ArCa",
    src: CHECKOUT_PAYMENT_ARCA_SRC,
    sourceWidthPx: 640,
    sourceHeightPx: 640,
    innerLogoScale: CHECKOUT_PAYMENT_ARCA_INNER_LOGO_SCALE,
  },
];

export const CHECKOUT_PAYMENT_IDRAM_LOGO_WIDTH_PX = 415;
export const CHECKOUT_PAYMENT_IDRAM_LOGO_HEIGHT_PX = 121;
export const CHECKOUT_PAYMENT_IDRAM_BOX_WIDTH_PX = 112;
export const CHECKOUT_PAYMENT_IDRAM_LOGO_DISPLAY_HEIGHT_PX = 32;
export const CHECKOUT_PAYMENT_IDRAM_BOX_WIDTH_MOBILE_PX = 96;
export const CHECKOUT_PAYMENT_IDRAM_LOGO_DISPLAY_HEIGHT_MOBILE_PX = 26;
export const CHECKOUT_PAYMENT_CASH_ICON_SIZE_MOBILE_PX = 42;
export const CHECKOUT_PAYMENT_CASH_ICON_SIZE_DESKTOP_PX = 36;

/** Uniform framed box — sized from Visa wordmark width at the given logo height. */
export function getCheckoutCardBadgeFramedBoxSize(
  logoHeightPx: number,
  paddingPx: number,
  boxHeightPx?: number,
): CheckoutCardBadgeFramedBoxSize {
  const visaBadge = CHECKOUT_CARD_PAYMENT_BADGES.find(
    (badge) => badge.alt === "Visa",
  );
  const heightPx = boxHeightPx ?? logoHeightPx + paddingPx * 2;

  if (!visaBadge) {
    return {
      widthPx: logoHeightPx + paddingPx * 2,
      heightPx,
    };
  }

  const visaLogoWidthPx = Math.round(
    visaBadge.sourceWidthPx * (logoHeightPx / visaBadge.sourceHeightPx),
  );

  return {
    widthPx: visaLogoWidthPx + paddingPx * 2,
    heightPx,
  };
}
