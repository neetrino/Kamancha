import Image from "next/image";

import type {
  CheckoutCardBadgeFramedBoxSize,
  CheckoutCardPaymentBadge,
} from "@/features/checkout/ui/checkout-payment-assets";

type CheckoutPaymentBadgeProps = {
  badge: CheckoutCardPaymentBadge;
  logoHeightPx: number;
  radiusPx: number;
  paddingPx: number;
  framed?: boolean;
  framedBoxSize?: CheckoutCardBadgeFramedBoxSize;
};

function getLogoSize(
  badge: CheckoutCardPaymentBadge,
  logoHeightPx: number,
): { widthPx: number; heightPx: number } {
  const scale = logoHeightPx / badge.sourceHeightPx;
  return {
    widthPx: Math.round(badge.sourceWidthPx * scale),
    heightPx: logoHeightPx,
  };
}

export function CheckoutPaymentBadge({
  badge,
  logoHeightPx,
  radiusPx,
  paddingPx,
  framed = false,
  framedBoxSize,
}: CheckoutPaymentBadgeProps) {
  const logoSize = getLogoSize(badge, logoHeightPx);

  if (!framed) {
    return (
      <Image
        src={badge.src}
        alt={badge.alt}
        width={logoSize.widthPx}
        height={logoSize.heightPx}
        className="shrink-0 object-contain object-left"
        style={{ height: logoSize.heightPx, width: logoSize.widthPx }}
      />
    );
  }

  const boxWidthPx = framedBoxSize?.widthPx ?? logoSize.widthPx + paddingPx * 2;
  const boxHeightPx =
    framedBoxSize?.heightPx ?? logoSize.heightPx + paddingPx * 2;
  const innerLogoScale = badge.innerLogoScale ?? 1;

  return (
    <div
      className="box-border flex shrink-0 items-center justify-center overflow-hidden border border-gray-200 bg-white"
      style={{
        width: boxWidthPx,
        height: boxHeightPx,
        borderRadius: radiusPx,
        padding: paddingPx,
      }}
    >
      <div
        className="relative h-full w-full"
        style={
          innerLogoScale !== 1
            ? { transform: `scale(${innerLogoScale})`, transformOrigin: "center" }
            : undefined
        }
      >
        <Image
          src={badge.src}
          alt={badge.alt}
          fill
          sizes={`${boxWidthPx}px`}
          className="object-contain object-center"
        />
      </div>
    </div>
  );
}
