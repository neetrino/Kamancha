import { notFound } from "next/navigation";

import { ProfileMobileShell } from "@/features/profile/ui/ProfileMobileShell";
import { ProfileSessionProvider } from "@/features/profile/ui/ProfileSessionContext";
import { ProfileSidebar } from "@/features/profile/ui/ProfileSidebar";
import { requireUser } from "@/lib/auth/policies";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

type ProfileLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function ProfileLayout({
  children,
  params,
}: ProfileLayoutProps) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const user = await requireUser(rawLocale);
  const dictionary = getDictionary(rawLocale);

  return (
    <ProfileSessionProvider user={user}>
      <div className="profile-desktop-page flex flex-col gap-6 pb-10 xl:flex-1 xl:flex-row xl:items-start xl:gap-8 xl:pb-0">
        <div className="profile-desktop-sidebar profile-sticky-band hidden w-[280px] shrink-0 xl:block">
          <ProfileSidebar
            locale={rawLocale}
            user={user}
            dictionary={dictionary.profile}
          />
        </div>

        <ProfileMobileShell
          locale={rawLocale}
          user={user}
          dictionary={dictionary.profile}
        >
          {children}
        </ProfileMobileShell>
      </div>
    </ProfileSessionProvider>
  );
}
