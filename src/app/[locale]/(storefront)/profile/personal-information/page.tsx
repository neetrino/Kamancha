import { notFound } from "next/navigation";

import { PersonalInformationForm } from "@/features/profile/ui/PersonalInformationForm";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type PersonalInformationPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PersonalInformationPage({
  params,
}: PersonalInformationPageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);

  return (
    <section>
      <PersonalInformationForm
        locale={locale}
        labels={{
          title: dictionary.profile.personal,
          firstName: dictionary.auth.firstName,
          lastName: dictionary.auth.lastName,
          email: dictionary.auth.email,
          phone: dictionary.auth.phone,
          cancel: dictionary.profile.cancel,
          save: dictionary.profile.save,
          saving: dictionary.profile.saving,
          firstNamePlaceholder: dictionary.auth.firstName,
          lastNamePlaceholder: dictionary.auth.lastName,
          emailPlaceholder: dictionary.auth.email,
          phonePlaceholder: dictionary.profile.addressBook.phonePlaceholder,
        }}
      />
    </section>
  );
}
