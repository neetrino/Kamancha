type NavIconProps = {
  className?: string;
};

/** Filled home — Figma 181:735. */
export function NavHomeIcon({ className = "" }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 27.2 26.2"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M26.1 23.576V10.624c0-.237-.056-.47-.165-.682a1.72 1.72 0 0 0-.46-.537L14.538 1.405A2.05 2.05 0 0 0 13.6 1.1c-.338 0-.667.107-.938.305L1.725 9.405a1.72 1.72 0 0 0-.46.537c-.109.212-.165.445-.165.682v12.952c0 .404.165.792.458 1.078.293.285.69.446 1.105.446h6.25c.414 0 .811-.16 1.104-.446.293-.286.458-.674.458-1.078v-4.571c0-.404.165-.792.458-1.078.293-.285.69-.446 1.105-.446h3.125c.414 0 .812.16 1.105.446.293.286.457.674.457 1.078v4.571c0 .404.165.792.458 1.078.293.285.69.446 1.105.446h6.25c.414 0 .812-.16 1.105-.446.293-.286.457-.674.457-1.078Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Serving cloche — Figma 181:744. */
export function NavClocheIcon({ className = "" }: NavIconProps) {
  return (
    <svg viewBox="0 0 29 25" fill="none" aria-hidden className={className}>
      <path
        d="M14.53 4.23a1.02 1.02 0 1 0 0-2.03 1.02 1.02 0 0 0 0 2.03Z"
        fill="currentColor"
      />
      <path
        d="M2.03 16.73c0-6.9 5.6-12.5 12.5-12.5s12.5 5.6 12.5 12.5v2.36H2.03v-2.36Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M1.05 19.09h26.96v3.05a2.1 2.1 0 0 1-.23 1.15 2.1 2.1 0 0 1-1.9 1.15H3.18a2.1 2.1 0 0 1-1.9-1.15 2.1 2.1 0 0 1-.23-1.15V19.1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Cart — Figma 192:177. */
export function NavCartIcon({ className = "" }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M1.5 2h3.2l1.9 12.7h13.3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.8 14.7h11.7l2.3-12.7H8.3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.2" cy="20.1" r="1.7" fill="currentColor" />
      <circle cx="20.8" cy="20.1" r="1.7" fill="currentColor" />
    </svg>
  );
}

/** Heart — Figma 192:175. */
export function NavHeartIcon({ className = "" }: NavIconProps) {
  return (
    <svg viewBox="0 0 28 24" fill="none" aria-hidden className={className}>
      <path
        d="M14 21.8S4.8 15.6 4.8 9.4A4.9 4.9 0 0 1 14 6.4a4.9 4.9 0 0 1 9.2 3c0 6.2-9.2 12.4-9.2 12.4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Active-home diamonds — Figma 196:194. */
export function NavActiveDiamonds({ className = "" }: NavIconProps) {
  return (
    <svg
      viewBox="0 0 26.13 9.21"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M.3 5.32C-.1 4.93-.1 4.28.3 3.89L4.01.28c.39-.38 1.01-.38 1.4 0L9.11 3.89c.4.39.4 1.04 0 1.43L5.4 8.93c-.39.38-1.01.38-1.39 0L.3 5.32Z" />
      <path d="M9.03 5.32c-.4-.39-.4-1.04 0-1.43L12.73.28c.39-.38 1.01-.38 1.4 0l3.7 3.61c.41.39.41 1.04 0 1.43l-3.7 3.6c-.39.38-1.01.38-1.4 0L9.03 5.32Z" />
      <path d="M17.02 5.32c-.4-.39-.4-1.04 0-1.43L20.73.28c.39-.38 1.01-.38 1.39 0l3.71 3.61c.4.39.4 1.04 0 1.43l-3.71 3.6c-.38.38-1.01.38-1.39 0l-3.71-3.6Z" />
    </svg>
  );
}

/** Rounded hamburger — Figma 196:209. */
export function HeaderMenuIcon({ className = "" }: NavIconProps) {
  return (
    <svg viewBox="0 0 34 34" fill="none" aria-hidden className={className}>
      <path
        d="M6.42 23.5h22.66M6.42 16.42h22.66M6.42 9.33h22.66"
        stroke="currentColor"
        strokeWidth="2.83"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** White user glyph on the forest profile disc — Figma 192:183. */
export function HeaderProfileGlyph({ className = "" }: NavIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle
        cx="12"
        cy="8"
        r="3.6"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
