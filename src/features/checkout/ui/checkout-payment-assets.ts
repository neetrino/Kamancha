/** Checkout payment logos and badge geometry (MaMarie checkout). */

import { staticAssetUrl } from "@/lib/media/static-asset-url";

export const CHECKOUT_PAYMENT_VISA_SRC = staticAssetUrl(
  "/assets/payments/checkout/visa-card.webp?v=2",
  { sameOrigin: true },
);
export const CHECKOUT_PAYMENT_MASTERCARD_SRC = staticAssetUrl(
  "/assets/payments/checkout/mastercard-card.webp?v=2",
  { sameOrigin: true },
);
export const CHECKOUT_PAYMENT_ARCA_SRC = staticAssetUrl(
  "/assets/payments/checkout/arca-card.webp?v=2",
  { sameOrigin: true },
);
export const CHECKOUT_PAYMENT_IDRAM_SRC = staticAssetUrl(
  "/assets/payments/checkout/idram.webp",
);
export const CHECKOUT_PAYMENT_TERMINAL_SRC = staticAssetUrl(
  "/assets/payments/checkout/terminal.webp?v=2",
  { sameOrigin: true },
);
export const CHECKOUT_PAYMENT_CASH_SRC = staticAssetUrl(
  "/assets/payments/checkout/cash.webp?v=4",
  { sameOrigin: true },
);

export const CHECKOUT_PAYMENT_OPTION_SELECTED_CLASS =
  "ring-2 ring-inset ring-brand-forest";
export const CHECKOUT_PAYMENT_OPTION_DEFAULT_CLASS =
  "hover:bg-gray-50";
export const CHECKOUT_PAYMENT_OPTION_BASE_CLASS =
  "flex cursor-pointer items-center overflow-hidden rounded-[15px] bg-white p-4 outline-none transition-colors [-webkit-tap-highlight-color:transparent] focus-within:outline-none focus-within:ring-0";

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

export const CHECKOUT_PAYMENT_CARD_ART_HEIGHT_DESKTOP_PX = 45;
export const CHECKOUT_PAYMENT_CARD_ART_HEIGHT_MOBILE_PX = 40;

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
    sourceWidthPx: 720,
    sourceHeightPx: 432,
  },
  {
    alt: "Mastercard",
    src: CHECKOUT_PAYMENT_MASTERCARD_SRC,
    sourceWidthPx: 720,
    sourceHeightPx: 393,
  },
  {
    alt: "ArCa",
    src: CHECKOUT_PAYMENT_ARCA_SRC,
    sourceWidthPx: 720,
    sourceHeightPx: 384,
  },
];

export const CHECKOUT_PAYMENT_IDRAM_LOGO_WIDTH_PX = 415;
export const CHECKOUT_PAYMENT_IDRAM_LOGO_HEIGHT_PX = 121;
export const CHECKOUT_PAYMENT_IDRAM_BOX_WIDTH_PX = 112;
export const CHECKOUT_PAYMENT_IDRAM_LOGO_DISPLAY_HEIGHT_PX = 32;
export const CHECKOUT_PAYMENT_IDRAM_BOX_WIDTH_MOBILE_PX = 96;
export const CHECKOUT_PAYMENT_IDRAM_LOGO_DISPLAY_HEIGHT_MOBILE_PX = 26;
export const CHECKOUT_PAYMENT_CASH_ICON_SIZE_MOBILE_PX = 52;
export const CHECKOUT_PAYMENT_CASH_ICON_SIZE_DESKTOP_PX = 56;
export const CHECKOUT_PAYMENT_TERMINAL_ICON_SIZE_MOBILE_PX = 64;
export const CHECKOUT_PAYMENT_TERMINAL_ICON_SIZE_DESKTOP_PX = 64;

/** Same box for Visa, Mastercard, and ArCa at a given display height. */
export function getCheckoutCardBadgeUniformBoxSize(
  logoHeightPx: number,
): CheckoutCardBadgeFramedBoxSize {
  const widthPx = Math.max(
    ...CHECKOUT_CARD_PAYMENT_BADGES.map((badge) =>
      Math.round(badge.sourceWidthPx * (logoHeightPx / badge.sourceHeightPx)),
    ),
  );

  return { widthPx, heightPx: logoHeightPx };
}

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
