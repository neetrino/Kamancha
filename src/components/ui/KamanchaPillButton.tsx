import Image from "next/image";
import type { MouseEventHandler, ReactNode } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { BRAND_ORNAMENT_SRC } from "@/lib/brand/assets";

type KamanchaPillShared = {
  label: string;
  variant?: "light" | "dark";
  className?: string;
  /** Figma node id — hero CTA 22:435, view-all 22:200. */
  figmaNodeId?: string;
};

export type KamanchaPillButtonProps =
  | (KamanchaPillShared & {
      href: string;
      type?: never;
      disabled?: never;
      onClick?: MouseEventHandler<HTMLAnchorElement>;
    })
  | (KamanchaPillShared & {
      href?: undefined;
      type?: "button" | "submit";
      disabled?: boolean;
      onClick?: MouseEventHandler<HTMLButtonElement>;
    });

function PillOrnament({
  side,
}: {
  side: "left" | "right";
}) {
  const mirrored = side === "right";

  return (
    <span
      className={`kamancha-pill-ornament kamancha-pill-ornament--${side}`}
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

function pillClassName(
  variant: "light" | "dark",
  className: string,
): string {
  const tones =
    variant === "light"
      ? "kamancha-pill-button--light bg-white text-brand-forest"
      : "kamancha-pill-button--dark bg-brand-forest text-white";

  return `kamancha-pill-button relative inline-flex min-h-16 w-full max-w-[280px] items-center justify-center overflow-hidden rounded-[50px] px-12 pt-2 pb-[7px] text-center text-[18px] leading-5 sm:max-w-[316px] ${tones} ${className}`;
}

function PillLabel({ children }: { children: ReactNode }) {
  return (
    <>
      <PillOrnament side="left" />
      <span className="relative z-[1] min-w-0 font-big-fat-boii font-normal">
        {children}
      </span>
      <PillOrnament side="right" />
    </>
  );
}

/**
 * Figma BUTTON (22:435) — pill CTA; hover slides ornaments outward + soft green fill.
 */
export function KamanchaPillButton({
  label,
  variant = "light",
  className = "",
  figmaNodeId = "22:435",
  ...props
}: KamanchaPillButtonProps) {
  const classNames = pillClassName(variant, className);

  if ("href" in props && props.href) {
    return (
      <AppLink
        href={props.href}
        prefetchPolicy="intent"
        onClick={props.onClick}
        data-node-id={figmaNodeId}
        className={classNames}
      >
        <PillLabel>{label}</PillLabel>
      </AppLink>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      data-node-id={figmaNodeId}
      className={`${classNames} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <PillLabel>{label}</PillLabel>
    </button>
  );
}
