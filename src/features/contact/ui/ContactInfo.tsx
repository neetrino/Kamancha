"use client";

import { useMemo, type ReactNode } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

import {
  Stagger,
  StaggerItem,
  scrollRevealViewport,
} from "@/components/ui/RevealMotion";
import { KAMANCHA_BRANCHES } from "@/lib/brand/store-locations";
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
  "flex min-h-16 items-center gap-3 rounded-[70px] bg-white py-2 pr-5 pl-2.5 text-left shadow-sm transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1.5 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const PILL_FULL_MOBILE =
  `${PILL_CLASS} max-[743px]:w-full max-[743px]:max-w-none min-[744px]:w-fit min-[744px]:max-w-[min(100%,calc(100vw-2.5rem))]`;

const PILL_PHONE_MOBILE =
  `${PILL_CLASS} max-[743px]:min-w-0 max-[743px]:flex-1 max-[743px]:pr-3 min-[744px]:w-fit min-[744px]:max-w-[min(100%,calc(100vw-2.5rem))]`;

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
  className = PILL_FULL_MOBILE,
}: {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
  className?: string;
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
    const isExternal =
      href.startsWith("http://") || href.startsWith("https://");
    return (
      <a
        href={href}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        data-contact-pill=""
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <div data-contact-pill="" className={className}>
      {inner}
    </div>
  );
}

function buildContactPills(copy: Dictionary["contact"]): {
  hours: ContactPillItem;
  phones: ContactPillItem[];
  addresses: ContactPillItem[];
  email: ContactPillItem;
} {
  return {
    hours: {
      id: "hours",
      icon: <Clock className="size-[22px]" strokeWidth={1.75} />,
      content: (
        <>
          {copy.hoursEverydayLabel}{" "}
          <span className={HOURS_TIME_CLASS}>{copy.hoursEverydayTime}</span>
        </>
      ),
    },
    phones: [
      {
        id: "phone",
        icon: <Phone className="size-[22px]" strokeWidth={1.75} />,
        href: `tel:${copy.storePhone.replace(/\s/g, "")}`,
        content: copy.storePhone,
      },
      {
        id: "phone-2",
        icon: <Phone className="size-[22px]" strokeWidth={1.75} />,
        href: `tel:${copy.storePhone2.replace(/\s/g, "")}`,
        content: copy.storePhone2,
      },
    ],
    addresses: [
      {
        id: "address-1",
        icon: <MapPin className="size-[22px]" strokeWidth={1.75} />,
        href: KAMANCHA_BRANCHES.tumanyan.mapUrl,
        content: copy.storeAddress,
      },
      {
        id: "address-2",
        icon: <MapPin className="size-[22px]" strokeWidth={1.75} />,
        href: KAMANCHA_BRANCHES.saryan.mapUrl,
        content: copy.storeAddress2,
      },
    ],
    email: {
      id: "email",
      icon: <Mail className="size-[22px]" strokeWidth={1.75} />,
      href: `mailto:${copy.storeEmail}`,
      content: (
        <span className="break-all min-[744px]:break-normal">
          {copy.storeEmail}
        </span>
      ),
    },
  };
}

export function ContactInfo({ copy }: ContactInfoProps) {
  const groups = useMemo(() => buildContactPills(copy), [copy]);

  return (
    <div data-node-id="267:221" className="w-full min-[744px]:w-fit">
      {/* Mobile: phones first */}
      <Stagger
        className="flex w-full flex-col gap-3 min-[744px]:hidden"
        {...STAGGER_PROPS}
      >
        <StaggerItem className="w-full">
          <div className="flex w-full gap-3">
            {groups.phones.map((item) => (
              <ContactPill
                key={item.id}
                icon={item.icon}
                href={item.href}
                className={PILL_PHONE_MOBILE}
              >
                {item.content}
              </ContactPill>
            ))}
          </div>
        </StaggerItem>

        <StaggerItem className="w-full">
          <ContactPill icon={groups.hours.icon}>
            {groups.hours.content}
          </ContactPill>
        </StaggerItem>

        {groups.addresses.map((item) => (
          <StaggerItem key={item.id} className="w-full">
            <ContactPill icon={item.icon} href={item.href}>
              {item.content}
            </ContactPill>
          </StaggerItem>
        ))}

        <StaggerItem className="w-full">
          <ContactPill icon={groups.email.icon} href={groups.email.href}>
            {groups.email.content}
          </ContactPill>
        </StaggerItem>
      </Stagger>

      {/* Tablet / desktop */}
      <Stagger
        className="hidden w-fit flex-row flex-wrap items-stretch justify-center gap-4 min-[744px]:flex"
        {...STAGGER_PROPS}
      >
        {groups.phones.map((item) => (
          <StaggerItem key={item.id} className="w-auto">
            <ContactPill
              icon={item.icon}
              href={item.href}
              className={PILL_FULL_MOBILE}
            >
              {item.content}
            </ContactPill>
          </StaggerItem>
        ))}
        <StaggerItem className="w-auto">
          <ContactPill icon={groups.hours.icon} className={PILL_FULL_MOBILE}>
            {groups.hours.content}
          </ContactPill>
        </StaggerItem>
        {groups.addresses.map((item) => (
          <StaggerItem key={item.id} className="w-auto">
            <ContactPill
              icon={item.icon}
              href={item.href}
              className={PILL_FULL_MOBILE}
            >
              {item.content}
            </ContactPill>
          </StaggerItem>
        ))}
        <StaggerItem className="w-auto">
          <ContactPill
            icon={groups.email.icon}
            href={groups.email.href}
            className={PILL_FULL_MOBILE}
          >
            {groups.email.content}
          </ContactPill>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
