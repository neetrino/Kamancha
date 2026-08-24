import Image from "next/image";
import type { MouseEventHandler, ReactNode } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { BRAND_ORNAMENT_SRC } from "@/lib/brand/assets";

type KamanchaPillShared = {
  label: string;
  variant?: "light" | "dark";
  /** `compact` — Figma mobile 268×64, no side ornaments. */
  size?: "default" | "compact";
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
  size: "default" | "compact",
  className: string,
): string {
  const tones =
    variant === "light"
      ? "kamancha-pill-button--light bg-white text-brand-forest"
      : "kamancha-pill-button--dark bg-brand-forest text-white";
  const sizing =
    size === "compact"
      ? "min-h-16 max-w-[268px] px-8 text-[16px] leading-6"
      : "min-h-16 max-w-[280px] px-12 text-[18px] leading-5 sm:max-w-[316px]";

  return `kamancha-pill-button relative inline-flex w-full items-center justify-center overflow-hidden rounded-[50px] pt-2 pb-[7px] text-center ${sizing} ${tones} ${className}`;
}

function PillLabel({
  children,
  ornaments,
}: {
  children: ReactNode;
  ornaments: boolean;
}) {
  return (
    <>
      {ornaments ? <PillOrnament side="left" /> : null}
      <span className="relative z-[1] min-w-0 font-big-fat-boii font-normal">
        {children}
      </span>
      {ornaments ? <PillOrnament side="right" /> : null}
    </>
  );
}

function isLinkPill(
  props: KamanchaPillButtonProps,
): props is Extract<KamanchaPillButtonProps, { href: string }> {
  return "href" in props && Boolean(props.href);
}

/**
 * Figma BUTTON (22:435) — pill CTA; hover slides ornaments outward + soft green fill.
 */
export function KamanchaPillButton(props: KamanchaPillButtonProps) {
  const {
    label,
    variant = "light",
    size = "default",
    className = "",
    figmaNodeId = "22:435",
  } = props;
  const classNames = pillClassName(variant, size, className);
  const ornaments = size !== "compact";

  if (isLinkPill(props)) {
    return (
      <AppLink
        href={props.href}
        prefetchPolicy="intent"
        onClick={props.onClick}
        data-node-id={figmaNodeId}
        className={classNames}
      >
        <PillLabel ornaments={ornaments}>{label}</PillLabel>
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
      <PillLabel ornaments={ornaments}>{label}</PillLabel>
    </button>
  );
}
