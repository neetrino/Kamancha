import Image from "next/image";

import { AppLink } from "@/components/ui/AppLink";
import { BRAND_ORNAMENT_SRC } from "@/lib/brand/assets";

type KamanchaPillButtonProps = {
  href: string;
  label: string;
  variant?: "light" | "dark";
  className?: string;
};

function PillOrnament({
  side,
}: {
  side: "left" | "right";
}) {
  const mirrored = side === "right";

  return (
    <span
      className={`kamancha-pill-ornament kamancha-pill-ornament--${side} relative flex h-[49px] w-[62px] shrink-0 items-center justify-center`}
      aria-hidden
    >
      <span
        className={`flex-none ${
          mirrored ? "-scale-y-100 rotate-90" : "rotate-90"
        }`}
      >
        <span className="relative block h-[62px] w-[49px] overflow-hidden rounded-[20px]">
          <Image
            src={BRAND_ORNAMENT_SRC}
            alt=""
            width={49}
            height={62}
            className="h-full w-full object-cover"
          />
        </span>
      </span>
    </span>
  );
}

/**
 * Figma BUTTON (22:435) — pill CTA; hover slides ornaments outward + soft green fill.
 */
export function KamanchaPillButton({
  href,
  label,
  variant = "light",
  className = "",
}: KamanchaPillButtonProps) {
  const tones =
    variant === "light"
      ? "kamancha-pill-button--light text-brand-forest"
      : "kamancha-pill-button--dark bg-brand-forest text-white";

  return (
    <AppLink
      href={href}
      prefetchPolicy="intent"
      data-node-id="22:435"
      className={`kamancha-pill-button inline-flex h-16 w-full max-w-[280px] items-center justify-between gap-5 overflow-hidden rounded-[50px] pt-2 pb-[7px] text-left text-[18px] leading-6 sm:max-w-[316px] ${tones} ${className}`}
    >
      <PillOrnament side="left" />
      <span className="relative z-[1] min-w-0 shrink-0 text-center font-big-fat-boii font-normal whitespace-nowrap">
        {label}
      </span>
      <PillOrnament side="right" />
    </AppLink>
  );
}
