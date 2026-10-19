import { notFound } from "next/navigation";

import { FooterContactSocial } from "@/components/layout/FooterContactSocial";
import { AboutHeroSection } from "@/features/about/ui/AboutHeroSection";
import { AboutStorySection } from "@/features/about/ui/AboutStorySection";
import { HomeOurStory } from "@/features/home/ui/HomeOurStory";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const copy = dictionary.about;
  const { social } = dictionary.contact;
  const { footer } = dictionary;

  return (
    <div className="about-page -mx-4 -mt-6 pb-8 sm:-mx-6 sm:-mt-8 xl:-mx-8 xl:pb-2">
      <AboutHeroSection copy={copy} />
      <AboutStorySection copy={copy} />
      <HomeOurStory
        tumanyan={copy.ourStory.tumanyan}
        saryan={copy.ourStory.saryan}
        delivery={copy.ourStory.delivery}
        founder={copy.ourStory.founder}
        pidehAlt={copy.ourStory.pidehAlt}
      />
      <div className="mt-10 px-4 sm:px-6 xl:hidden">
        <FooterContactSocial
          instagramHref={social.instagram}
          facebookHref={social.facebook}
          tiktokHref={social.tiktok}
          instagramLabel={footer.instagram}
          facebookLabel={footer.facebook}
          tiktokLabel={footer.tiktok}
        />
      </div>
    </div>
  );
}
