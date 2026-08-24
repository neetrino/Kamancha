"use client";

import type { ReactNode } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Stagger, StaggerItem, scrollRevealViewport } from "@/components/ui/RevealMotion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactInfoProps = {
  copy: Dictionary["contact"];
};

const PILL_CLASS =
  "flex min-h-16 items-center gap-3 rounded-[70px] bg-white py-2 pr-5 pl-2.5 text-left";

const ICON_WRAP_CLASS =
  "flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white";

const HOURS_TIME_CLASS = "text-[#b08a5a]";

function ContactPill({
  icon,
  children,
  href,
}: {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <span className={ICON_WRAP_CLASS}>{icon}</span>
      <span className="min-w-0 text-[15px] leading-4 font-medium tracking-[-0.3px] text-[#0a0a0a]">
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${PILL_CLASS} transition-opacity hover:opacity-90`}>
        {inner}
      </a>
    );
  }

  return <div className={PILL_CLASS}>{inner}</div>;
}

export function ContactInfo({ copy }: ContactInfoProps) {
  const telHref = `tel:${copy.storePhone.replace(/\s/g, "")}`;

  return (
    <div data-node-id="267:221">
      <Stagger
        className="flex flex-wrap items-stretch justify-center gap-4"
        amount={scrollRevealViewport.amount}
        viewportMargin={scrollRevealViewport.viewportMargin}
        stagger={0.08}
      >
        <StaggerItem>
          <ContactPill icon={<Clock className="size-[22px]" strokeWidth={1.75} />}>
            {copy.hoursEverydayLabel}{" "}
            <span className={HOURS_TIME_CLASS}>{copy.hoursEverydayTime}</span>
          </ContactPill>
        </StaggerItem>

        <StaggerItem>
          <ContactPill
            icon={<Phone className="size-[22px]" strokeWidth={1.75} />}
            href={telHref}
          >
            {copy.storePhone}
          </ContactPill>
        </StaggerItem>

        <StaggerItem>
          <ContactPill
            icon={<Mail className="size-[22px]" strokeWidth={1.75} />}
            href={`mailto:${copy.storeEmail}`}
          >
            <span className="break-all">{copy.storeEmail}</span>
          </ContactPill>
        </StaggerItem>

        <StaggerItem>
          <ContactPill icon={<MapPin className="size-[22px]" strokeWidth={1.75} />}>
            {copy.storeAddress}
          </ContactPill>
        </StaggerItem>

        <StaggerItem>
          <ContactPill icon={<MapPin className="size-[22px]" strokeWidth={1.75} />}>
            {copy.storeAddress2}
          </ContactPill>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
