/** Shared Tailwind classes: desktop admin sidebar flush to the viewport left edge. */
export const ADMIN_SIDEBAR_MOBILE_DRAWER_WRAP =
  "mb-6 shrink-0 px-4 pt-8 sm:px-6 lg:hidden lg:pt-0";

/** Navbar Kamancha wordmark, sized for the admin sidebar/header. */
export const ADMIN_BRAND_LOGO_CLASS =
  "relative inline-flex h-10 w-[84px] shrink-0 items-center";
export const ADMIN_BRAND_LOGO_COLLAPSED_CLASS =
  "relative inline-flex h-[27px] w-14 shrink-0 items-center";

/** Width is set in `AdminSidebar` (expanded vs collapsed). */
export const ADMIN_SIDEBAR_ASIDE =
  "hidden lg:flex lg:h-full lg:shrink-0 lg:flex-col overflow-hidden rounded-r-[15px] border-r border-white/15 bg-brand-forest transition-[width] duration-200 ease-out";

/** Desktop: viewport-height shell so only the main column scrolls; sidebar stays fixed. */
export const ADMIN_PAGE_SHELL =
  "flex min-h-screen flex-col bg-gray-50 lg:h-dvh lg:max-h-dvh lg:flex-row lg:overflow-hidden";

export const ADMIN_MAIN_COLUMN =
  "min-w-0 flex-1 px-4 pb-8 pt-12 sm:px-6 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:px-8";

export const ADMIN_MAIN_INNER = "w-full";
