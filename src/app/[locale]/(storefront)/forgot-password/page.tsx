import { notFound } from "next/navigation";

import { AuthPageShell } from "@/features/auth/ui/AuthPageShell";
import { ForgotPasswordForm } from "@/features/auth/ui/ForgotPasswordForm";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({
  params,
}: ForgotPasswordPageProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const dictionary = getDictionary(rawLocale);

  return (
    <AuthPageShell title={dictionary.auth.forgotPasswordTitle} compactForm>
      <ForgotPasswordForm locale={rawLocale} dictionary={dictionary.auth} />
    </AuthPageShell>
  );
}
