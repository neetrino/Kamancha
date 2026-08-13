import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";

import { ProfileSidebarNav } from "@/features/profile/ui/ProfileSidebarNav";
import { logoutAction } from "@/features/auth/logout-action";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { SessionUser } from "@/lib/auth/session";

type ProfileSidebarProps = {
  locale: Locale;
  user: SessionUser;
  dictionary: Dictionary["profile"];
};

function ProfileContactRow({
  icon,
  value,
}: {
  icon: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/50 bg-white/55 px-3.5 py-2.5 text-left shadow-sm">
      <span className="shrink-0 text-brand-forest">{icon}</span>
      <p className="min-w-0 break-all text-xs font-medium text-gray-800 sm:text-sm">
        {value}
      </p>
    </div>
  );
}

export function ProfileSidebar({
  locale,
  user,
  dictionary,
}: ProfileSidebarProps) {
  const logoutWithLocale = logoutAction.bind(null, locale);

  return (
    <aside
      className="liquid-glass isolate flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl"
      aria-label={dictionary.title}
    >
      <div className="relative z-[2] shrink-0 border-b border-white/35 p-4 sm:p-5">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full bg-brand-forest text-xl font-semibold text-white shadow-[0_0_0_3px_rgba(255,255,255,0.45)]">
            {user.firstName.slice(0, 1).toUpperCase()}
            {user.lastName.slice(0, 1).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <p className="font-big-fat-boii text-lg font-normal tracking-wide text-gray-900 uppercase">
              {user.firstName}
            </p>
            <p className="text-xs font-medium tracking-wide text-gray-700">
              {user.lastName}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <ProfileContactRow
            icon={<Mail className="h-4 w-4" aria-hidden />}
            value={user.email}
          />
          {user.phone ? (
            <ProfileContactRow
              icon={<Phone className="h-4 w-4" aria-hidden />}
              value={user.phone}
            />
          ) : null}
        </div>
      </div>

      <div className="relative z-[2] flex min-h-0 flex-1 flex-col overflow-hidden">
        <ProfileSidebarNav
          locale={locale}
          dictionary={dictionary}
          logoutAction={logoutWithLocale}
        />
      </div>
    </aside>
  );
}
