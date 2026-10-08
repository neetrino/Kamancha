import { Montserrat } from "next/font/google";

const comingSoonFont = Montserrat({
  subsets: ["latin"],
  weight: "600",
});

const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
] as const;

/** Auth screens stay reachable so an account can enter the store. */
export function isStorefrontAuthPath(pathname: string): boolean {
  const segments = pathname.split("/").filter(Boolean);
  const route = segments.slice(1).join("/");
  return AUTH_PATHS.some(
    (path) => route === path.slice(1) || route.startsWith(`${path.slice(1)}/`),
  );
}

export function ComingSoonScreen() {
  return (
    <div className="relative min-h-dvh w-full bg-[#3d7a32]">
      <img
        src="/assets/brand/coming-soon/mobile.webp"
        alt=""
        className="absolute inset-0 size-full object-cover object-center md:hidden"
      />
      <img
        src="/assets/brand/coming-soon/desktop.webp"
        alt=""
        className="absolute inset-0 hidden size-full object-cover object-center md:block"
      />
      <h1
        className={`${comingSoonFont.className} pointer-events-none absolute left-1/2 top-1/2 w-[94%] -translate-x-1/2 -translate-y-1/2 text-center text-[20vw] uppercase leading-[0.86] tracking-[-0.06em] text-white md:w-auto md:text-[8.4vw]`}
      >
        Coming
        <br />
        Soon
      </h1>
    </div>
  );
}
