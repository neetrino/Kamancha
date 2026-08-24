"use client";

import { useMemo, type ReactNode } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { Stagger, StaggerItem, scrollRevealViewport } from "@/components/ui/RevealMotion";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type ContactInfoProps = {
  copy: Dictionary["contact"];
};

type ContactPillItem = {
  id: string;
  icon: ReactNode;
  href?: string;
  content: ReactNode;
};

const PILL_CLASS =
  "flex min-h-16 items-center gap-3 rounded-[70px] bg-white py-2 pr-5 pl-2.5 text-left max-[743px]:w-full max-[743px]:max-w-none min-[744px]:w-fit min-[744px]:max-w-[min(100%,calc(100vw-2.5rem))]";

const ICON_WRAP_CLASS =
  "flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-forest text-white";

const HOURS_TIME_CLASS = "text-[#b08a5a]";

const STAGGER_PROPS = {
  amount: scrollRevealViewport.amount,
  viewportMargin: scrollRevealViewport.viewportMargin,
  stagger: 0.08,
} as const;

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
      <a
        href={href}
        className={`${PILL_CLASS} transition-opacity hover:opacity-90`}
      >
        {inner}
      </a>
    );
  }

  return <div className={PILL_CLASS}>{inner}</div>;
}

function buildContactPills(copy: Dictionary["contact"]): ContactPillItem[] {
  return [
    {
      id: "hours",
      icon: <Clock className="size-[22px]" strokeWidth={1.75} />,
      content: (
        <>
          {copy.hoursEverydayLabel}{" "}
          <span className={HOURS_TIME_CLASS}>{copy.hoursEverydayTime}</span>
        </>
      ),
    },
    {
      id: "phone",
      icon: <Phone className="size-[22px]" strokeWidth={1.75} />,
      href: `tel:${copy.storePhone.replace(/\s/g, "")}`,
      content: copy.storePhone,
    },
    {
      id: "email",
      icon: <Mail className="size-[22px]" strokeWidth={1.75} />,
      href: `mailto:${copy.storeEmail}`,
      content: <span className="break-all min-[744px]:break-normal">{copy.storeEmail}</span>,
    },
    {
      id: "address-1",
      icon: <MapPin className="size-[22px]" strokeWidth={1.75} />,
      content: copy.storeAddress,
    },
    {
      id: "address-2",
      icon: <MapPin className="size-[22px]" strokeWidth={1.75} />,
      content: copy.storeAddress2,
    },
  ];
}

function ContactPillRow({ item }: { item: ContactPillItem }) {
  return (
    <StaggerItem className="w-full min-[744px]:w-auto">
      <ContactPill icon={item.icon} href={item.href}>
        {item.content}
      </ContactPill>
    </StaggerItem>
  );
}

export function ContactInfo({ copy }: ContactInfoProps) {
  const pills = useMemo(() => buildContactPills(copy), [copy]);

  return (
    <div data-node-id="267:221" className="w-full">
      <Stagger
        className="flex w-full flex-col gap-3 min-[744px]:flex-row min-[744px]:flex-wrap min-[744px]:items-stretch min-[744px]:justify-center min-[744px]:gap-4"
        {...STAGGER_PROPS}
      >
        {pills.map((item) => (
          <ContactPillRow key={item.id} item={item} />
        ))}
      </Stagger>
    </div>
  );
}
