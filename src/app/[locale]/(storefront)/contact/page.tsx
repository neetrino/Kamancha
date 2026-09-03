import { notFound } from "next/navigation";

import { AuthPageShell } from "@/features/auth/ui/AuthPageShell";
import { ContactForm } from "@/features/contact/ui/ContactForm";
import { ContactFooter } from "@/features/contact/ui/ContactFooter";
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
    <AuthPageShell
      title={copy.heading}
      raiseLeftHand
      footer={
        <div className="mt-15 min-[744px]:mt-28 min-[744px]:sm:mt-32 xl:mt-36">
          <ContactFooter copy={copy} />
        </div>
      }
    >
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
    </AuthPageShell>
  );
}
