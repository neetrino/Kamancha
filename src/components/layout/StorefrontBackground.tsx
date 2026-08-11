import Image from "next/image";

/**
 * Figma `background 1` (103:2122) over Home page `#265127`:
 * absolute cover image + `mix-blend-mode: overlay`.
 */
export function StorefrontBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Image
        src="/assets/brand/home-texture.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-top mix-blend-overlay"
      />
    </div>
  );
}
