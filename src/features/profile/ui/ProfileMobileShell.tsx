"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { ProfileMobileHub } from "@/features/profile/ui/ProfileMobileHub";
import { ProfileMobileTabSheet } from "@/features/profile/ui/ProfileMobileTabSheet";
import { ProfilePageReveal } from "@/features/profile/ui/ProfilePageReveal";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { SessionUser } from "@/lib/auth/session";

type ProfileMobileShellProps = {
  locale: Locale;
  user: SessionUser;
  dictionary: Dictionary["profile"];
  children: ReactNode;
};

function isProfileHubPath(pathname: string, locale: Locale): boolean {
  const hubHref = `/${locale}/profile`;
  return pathname === hubHref || pathname === `${hubHref}/`;
}

/**
 * Mobile profile shell: hub always visible; section content in a bottom sheet.
 * Desktop content column is unchanged (`xl+`). Renders `children` once (matchMedia).
 */
export function ProfileMobileShell({
  locale,
  user,
  dictionary,
  children,
}: ProfileMobileShellProps) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isHub = isProfileHubPath(pathname, locale);
  const [hubSheetOpen, setHubSheetOpen] = useState(false);
  /** Keeps sub-route content mounted while the close keyframe plays. */
  const [closingToHub, setClosingToHub] = useState(false);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    function sync(): void {
      setIsDesktop(media.matches);
    }
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isHub) {
      setHubSheetOpen(false);
      setClosingToHub(false);
    }
  }, [isHub, pathname]);

  const sheetOpen = (!isHub || hubSheetOpen) && !closingToHub;

  const closeSheet = useCallback(() => {
    if (isHub) {
      setHubSheetOpen(false);
      return;
    }
    setClosingToHub(true);
  }, [isHub]);

  const handleSheetExited = useCallback(() => {
    if (!closingToHub) return;
    // Keep `closingToHub` true until the hub route mounts — otherwise
    // `sheetOpen` flips back on and the sheet re-opens with a jerk.
    router.push(`/${locale}/profile`);
  }, [closingToHub, locale, router]);

  const openHubDashboard = useCallback(() => {
    setHubSheetOpen(true);
  }, []);

  const hub = (
    <ProfileMobileHub
      locale={locale}
      user={user}
      dictionary={dictionary}
      onOpenDashboard={openHubDashboard}
    />
  );

  const revealed = (
    <ProfilePageReveal y={isDesktop ? 28 : 0}>{children}</ProfilePageReveal>
  );

  const desktopColumn = (
    <div className="profile-desktop-content profile-sticky-band min-w-0 flex-1">
      {revealed}
    </div>
  );

  let content: ReactNode;

  // SSR / pre-hydration: hub on mobile via CSS; content only from xl up.
  if (isDesktop === null) {
    content = (
      <>
        <div className="profile-mobile-page w-full xl:hidden">{hub}</div>
        <div className="profile-desktop-content profile-sticky-band hidden min-w-0 flex-1 xl:block">
          {revealed}
        </div>
      </>
    );
  } else if (isDesktop) {
    content = desktopColumn;
  } else {
    content = (
      <div className="profile-mobile-page w-full">
        {hub}
        <ProfileMobileTabSheet
          open={sheetOpen}
          onClose={closeSheet}
          onExited={handleSheetExited}
          ariaLabel={dictionary.title}
        >
          {revealed}
        </ProfileMobileTabSheet>
      </div>
    );
  }

  return content;
}
