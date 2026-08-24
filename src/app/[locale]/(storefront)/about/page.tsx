import { notFound } from "next/navigation";

import { AboutHeroSection } from "@/features/about/ui/AboutHeroSection";
import { AboutStorySection } from "@/features/about/ui/AboutStorySection";
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

  return (
    <div className="-mx-4 -mt-6 pb-8 sm:-mx-6 sm:-mt-8 lg:-mx-8">
      <AboutHeroSection copy={copy} />
      <AboutStorySection copy={copy} />
    </div>
  );
}
