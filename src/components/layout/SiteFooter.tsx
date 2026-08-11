import Image from "next/image";
import type { ReactNode } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { BrandLogo } from "@/components/layout/BrandLogo";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";

type SiteFooterProps = {
  dictionary: Dictionary;
  locale: Locale;
};

type FooterLink = {
  href: string;
  label: string;
};

function SocialCircle({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/18 text-white transition-colors hover:border-white/40 hover:bg-white/5"
    >
      {children}
    </a>
  );
}

function FooterColumn({
  title,
  links,
  figmaNodeId,
}: {
  title: string;
  links: readonly FooterLink[];
  figmaNodeId?: string;
}) {
  return (
    <div data-node-id={figmaNodeId}>
      <h4 className="font-big-fat-boii text-[18px] leading-[15px] font-normal tracking-wide text-white uppercase">
        {title}
      </h4>
      <ul className="mt-6 flex flex-col gap-4">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <AppLink
              href={link.href}
              prefetchPolicy="intent"
              className="font-big-fat-boii text-[14px] leading-5 font-normal text-white/50 transition-colors hover:text-white"
            >
              {link.label}
            </AppLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Storefront footer — Figma 22:337 / container 22:338.
 */
export function SiteFooter({ dictionary, locale }: SiteFooterProps) {
  const year = new Date().getFullYear();
  const { footer, contact } = dictionary;

  const navigationLinks: FooterLink[] = [
    { href: `/${locale}/products`, label: footer.menu },
    { href: `/${locale}/about`, label: footer.about },
    { href: `/${locale}/products`, label: footer.specialOffers },
    { href: `/${locale}/blog`, label: footer.gallery },
    { href: `/${locale}/contact`, label: footer.contact },
  ];

  const supportLinks: FooterLink[] = [
    { href: `/${locale}/legal/terms`, label: footer.shippingReturns },
    { href: `/${locale}/legal/terms`, label: footer.terms },
    { href: `/${locale}/legal/privacy`, label: footer.privacyPolicy },
    { href: `/${locale}/contact`, label: footer.faq },
  ];

  return (
    <footer
      data-node-id="22:337"
      className="storefront-footer relative z-[2] mt-auto hidden bg-transparent pt-20 md:block md:pt-28 lg:pt-36"
    >
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-5">
        <div
          data-node-id="22:338"
          className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-x-8 gap-y-12 border-b border-white/12 pb-[65px] sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-x-[40px]"
        >
          {/* Brand column — 22:339 */}
          <div
            data-node-id="22:339"
            className="flex max-w-[469px] flex-col items-start"
          >
            <BrandLogo locale={locale} brandName={dictionary.brand} />
            <p
              data-node-id="22:341"
              className="mt-5 max-w-[320px] text-[14px] leading-[22.75px] text-white/45"
            >
              {footer.tagline}
            </p>
            <div data-node-id="22:342" className="mt-8 flex items-start gap-3">
              <SocialCircle
                href={contact.social.instagram}
                label={footer.instagram}
              >
                <Image
                  src="/assets/brand/footer/instagram.svg"
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                />
              </SocialCircle>
              <SocialCircle
                href={contact.social.facebook}
                label={footer.facebook}
              >
                <Image
                  src="/assets/brand/footer/facebook.svg"
                  alt=""
                  width={16}
                  height={16}
                  unoptimized
                />
              </SocialCircle>
              <SocialCircle href={contact.social.tiktok} label={footer.tiktok}>
                <span className="font-big-fat-boii text-[12px] leading-4 font-normal text-white">
                  Tk
                </span>
              </SocialCircle>
            </div>
          </div>

          <FooterColumn
            figmaNodeId="22:354"
            title={footer.navigationTitle}
            links={navigationLinks}
          />

          <FooterColumn
            figmaNodeId="22:368"
            title={footer.supportTitle}
            links={supportLinks}
          />

          <div data-node-id="22:375">
            <h4
              data-node-id="22:377"
              className="font-big-fat-boii text-[18px] leading-[15px] font-normal tracking-wide text-white uppercase"
            >
              {footer.contactTitle}
            </h4>
            <div className="mt-6 flex flex-col gap-3">
              <p className="font-big-fat-boii text-[14px] leading-5 font-normal text-white/50">
                {footer.address}
              </p>
              <a
                href={`tel:${footer.phone.replace(/\s/g, "")}`}
                className="font-big-fat-boii text-[14px] leading-5 font-normal text-white/50 transition-colors hover:text-white"
              >
                {footer.phone}
              </a>
              <a
                href={`mailto:${footer.email}`}
                className="font-big-fat-boii text-[14px] leading-5 font-normal uppercase text-white/50 transition-colors hover:text-white"
              >
                {footer.email}
              </a>
              <div className="mt-1 border-t border-white/10 pt-4">
                <p className="font-big-fat-boii text-[14px] leading-5 font-normal text-white/50">
                  {footer.hours}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright bar — Figma 22:388 */}
        <div
          data-node-id="22:388"
          className="mx-auto flex w-full max-w-[1280px] items-center justify-center pt-8 pb-4"
        >
          <p
            data-node-id="22:390"
            className="max-w-full text-center font-big-fat-boii text-[14px] leading-5 font-normal text-white/40 sm:whitespace-nowrap"
          >
            {footer.copyrightBefore.replace("{year}", String(year))}{" "}
            <a
              href="https://neetrino.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white transition-colors hover:text-white/80"
            >
              {footer.copyrightCompany}
            </a>
            {footer.copyrightAfter ? ` ${footer.copyrightAfter}` : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
