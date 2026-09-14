import Image from "next/image";
import type { ReactNode } from "react";

import { AppLink } from "@/components/ui/AppLink";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { FooterContactSocial } from "@/components/layout/FooterContactSocial";
import { KAMANCHA_BRANCHES } from "@/lib/brand/store-locations";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { staticAssetUrl } from "@/lib/media/static-asset-url";

type SiteFooterProps = {
  dictionary: Dictionary;
  locale: Locale;
};

type FooterLink = {
  href: string;
  label: string;
};

const CONTACT_LINK_CLASS =
  "font-big-fat-boii text-[14px] leading-5 font-normal whitespace-nowrap text-white/50 transition-colors hover:text-white";

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
      className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/18 text-white transition-colors hover:border-white/40 hover:bg-white/5"
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

const COPYRIGHT_CREATED_BY = "Created by";
const COPYRIGHT_COMPANY_SHORT = "Neetrino";
const COPYRIGHT_COMPANY_HREF = "https://neetrino.com";

/** Big Fat Boii maps © and | but those glyphs have empty outlines. */
function CopyrightSymbol() {
  return <span className="font-sans">©</span>;
}

function CopyrightPipe() {
  return (
    <span aria-hidden className="font-sans">
      |
    </span>
  );
}

function FooterCopyright({
  social,
  labels,
}: {
  social: Dictionary["contact"]["social"];
  labels: {
    instagram: string;
    facebook: string;
    tiktok: string;
  };
}) {
  const year = new Date().getFullYear();

  return (
    <div
      data-node-id="22:388"
      className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-center gap-4 pt-4 pb-2 xl:pt-8 xl:pb-4"
    >
      <FooterContactSocial
        instagramHref={social.instagram}
        facebookHref={social.facebook}
        tiktokHref={social.tiktok}
        instagramLabel={labels.instagram}
        facebookLabel={labels.facebook}
        tiktokLabel={labels.tiktok}
      />
      <p
        data-node-id="22:390"
        className="max-w-full text-center font-big-fat-boii text-[12px] leading-4 font-normal whitespace-nowrap text-white/40 xl:text-[13px] xl:leading-5"
      >
        <span className="xl:hidden">
          <CopyrightSymbol /> {year} <CopyrightPipe /> {COPYRIGHT_CREATED_BY}{" "}
          <a
            href={COPYRIGHT_COMPANY_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-colors hover:text-white/80"
          >
            {COPYRIGHT_COMPANY_SHORT}
          </a>
        </span>
        <span className="hidden xl:inline">
          <CopyrightSymbol /> {year} <CopyrightPipe /> All Rights Reserved{" "}
          <CopyrightPipe /> {COPYRIGHT_CREATED_BY}{" "}
          <a
            href={COPYRIGHT_COMPANY_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-colors hover:text-white/80"
          >
            {COPYRIGHT_COMPANY_SHORT}
          </a>
        </span>
      </p>
    </div>
  );
}

/**
 * Storefront footer — Figma 22:337 / container 22:338.
 * Full columns: desktop only. Copyright also at the end on mobile.
 */
export function SiteFooter({ dictionary, locale }: SiteFooterProps) {
  const { footer, contact } = dictionary;

  const navigationLinks: FooterLink[] = [
    { href: `/${locale}/products`, label: footer.menu },
    { href: `/${locale}/about`, label: footer.about },
    { href: `/${locale}/blog`, label: footer.blog },
    { href: `/${locale}/contact`, label: footer.contact },
  ];

  const supportLinks: FooterLink[] = [
    { href: `/${locale}/legal/delivery`, label: footer.deliveryTerms },
    { href: `/${locale}/legal/terms`, label: footer.terms },
    { href: `/${locale}/legal/privacy`, label: footer.privacyPolicy },
  ];

  return (
    <footer
      data-node-id="22:337"
      className="storefront-footer relative z-[2] mt-auto bg-transparent pb-[calc(var(--mobile-bottom-nav-height)+var(--mobile-bottom-nav-bottom-inset)+1rem)] xl:pb-0 xl:pt-36"
    >
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-5">
        <div
          data-node-id="22:338"
          className="mx-auto hidden w-full max-w-[1280px] grid-cols-1 gap-x-8 gap-y-12 border-b border-white/12 pb-[65px] sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-x-[40px] xl:grid"
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
                  src={staticAssetUrl("/assets/brand/footer/instagram.svg")}
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                />
              </SocialCircle>
              <SocialCircle
                href={contact.social.facebook}
                label={footer.facebook}
              >
                <Image
                  src={staticAssetUrl("/assets/brand/footer/facebook.svg")}
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                />
              </SocialCircle>
              <SocialCircle href={contact.social.tiktok} label={footer.tiktok}>
                <Image
                  src={staticAssetUrl("/assets/brand/footer/tiktok.webp")}
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                />
              </SocialCircle>
            </div>
          </div>

          <FooterColumn
            figmaNodeId="22:354"
            title={footer.navigationTitle}
            links={navigationLinks}
          />

          <div className="translate-x-10">
            <FooterColumn
              figmaNodeId="22:368"
              title={footer.supportTitle}
              links={supportLinks}
            />
          </div>

          <div data-node-id="22:375" className="w-fit justify-self-end">
            <h4
              data-node-id="22:377"
              className="font-big-fat-boii text-[18px] leading-[15px] font-normal tracking-wide text-white uppercase"
            >
              {footer.contactTitle}
            </h4>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={KAMANCHA_BRANCHES.tumanyan.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={CONTACT_LINK_CLASS}
              >
                {footer.address}
              </a>
              <a
                href={KAMANCHA_BRANCHES.saryan.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={CONTACT_LINK_CLASS}
              >
                {footer.address2}
              </a>
              <p className="font-big-fat-boii text-[14px] leading-5 font-normal whitespace-nowrap text-white/50">
                <a
                  href={`tel:${footer.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {footer.phone}
                </a>
                <span aria-hidden className="mx-2 font-sans text-white/50">
                  |
                </span>
                <a
                  href={`tel:${footer.phone2.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-white"
                >
                  {footer.phone2}
                </a>
              </p>
              <a
                href={`mailto:${footer.email}`}
                className={`${CONTACT_LINK_CLASS} uppercase`}
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

        <FooterCopyright
          social={contact.social}
          labels={{
            instagram: footer.instagram,
            facebook: footer.facebook,
            tiktok: footer.tiktok,
          }}
        />
      </div>
    </footer>
  );
}
