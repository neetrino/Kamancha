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
}: {
  title: string;
  links: readonly FooterLink[];
}) {
  return (
    <div>
      <h4 className="font-big-fat-boii text-[18px] leading-[15px] font-normal text-white uppercase">
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
      className="storefront-footer relative z-[2] mt-auto hidden bg-transparent md:block"
    >
      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-5">
        <div
          data-node-id="22:338"
          className="mx-auto flex w-full max-w-[1375px] flex-wrap content-start items-start gap-x-6 gap-y-12 border-b border-white/12 pb-16 pt-10 lg:gap-x-[10px]"
        >
          {/* Brand column */}
          <div
            data-node-id="22:339"
            className="flex w-full max-w-[469px] flex-col items-start sm:w-[469px]"
          >
            <BrandLogo locale={locale} brandName={dictionary.brand} />
            <p
              data-node-id="22:341"
              className="mt-4 max-w-[320px] text-[14px] leading-[22.75px] text-white/45"
            >
              {footer.tagline}
            </p>
            <div
              data-node-id="22:342"
              className="mt-8 flex items-start gap-3"
            >
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

          <div data-node-id="22:354" className="min-w-[180px] flex-1 basis-[200px]">
            <FooterColumn
              title={footer.navigationTitle}
              links={navigationLinks}
            />
          </div>

          <div data-node-id="22:368" className="min-w-[200px] flex-1 basis-[240px]">
            <FooterColumn title={footer.supportTitle} links={supportLinks} />
          </div>

          <div
            data-node-id="22:375"
            className="min-w-[200px] flex-1 basis-[240px]"
          >
            <h4
              data-node-id="22:377"
              className="font-big-fat-boii text-[18px] leading-[15px] font-normal text-white uppercase"
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
                className="font-big-fat-boii text-[14px] leading-5 font-normal text-white/50 transition-colors hover:text-white"
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

        <div
          data-node-id="22:388"
          className="mx-auto flex w-full max-w-[1375px] justify-center py-8"
        >
          <p
            data-node-id="22:390"
            className="text-center font-big-fat-boii text-[14px] leading-5 font-normal text-white/40"
          >
            {footer.copyrightBefore.replace("{year}", String(year))}{" "}
            <span className="text-white">{footer.copyrightCompany}</span>
            {footer.copyrightAfter ? ` ${footer.copyrightAfter}` : null}
          </p>
        </div>
      </div>
    </footer>
  );
}
