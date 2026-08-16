import { notFound } from "next/navigation";

import { ContactForm } from "@/features/contact/ui/ContactForm";
import { ContactHands } from "@/features/contact/ui/ContactHands";
import { ContactInfo } from "@/features/contact/ui/ContactInfo";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);
  const copy = dictionary.contact;

  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-visible pt-8 sm:pt-10">
      <ContactHands />
      <div className="relative z-[1] mx-auto max-w-[1440px] px-4 pb-4 sm:px-6 lg:px-8">

        <section
          className="relative z-[1] mx-auto flex max-w-[633px] flex-col items-center pt-4"
          data-node-id="267:207"
        >
          <div className="mb-3 flex items-center justify-center gap-2" aria-hidden>
            <span className="size-1.5 rounded-full bg-white" />
            <span className="size-1.5 rounded-full bg-white" />
            <span className="size-1.5 rounded-full bg-white" />
          </div>
          <h1 className="mb-8 text-center font-big-fat-boii text-[40px] leading-[1.1] font-normal tracking-wide text-white uppercase sm:text-[48px] md:text-[58px] md:leading-[90px]">
            {copy.heading}
          </h1>

          <div className="w-full rounded-[30px] bg-white px-5 pt-10 pb-0">
            <ContactForm
              copy={{
                name: copy.name,
                email: copy.email,
                subject: copy.subject,
                message: copy.message,
                namePlaceholder: copy.namePlaceholder,
                emailPlaceholder: copy.emailPlaceholder,
                subjectPlaceholder: copy.subjectPlaceholder,
                messagePlaceholder: copy.messagePlaceholder,
                submit: copy.submit,
                success: copy.success,
                error: copy.error,
              }}
            />
          </div>
        </section>

        <div className="relative z-[1] mt-20 mb-4 sm:mt-24 lg:mt-28">
          <ContactInfo copy={copy} />
        </div>
      </div>
    </div>
  );
}
