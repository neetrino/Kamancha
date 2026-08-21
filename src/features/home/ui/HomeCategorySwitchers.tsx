type HomeCategorySwitchersProps = {
  previousLabel: string;
  nextLabel: string;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

function PrevArrowIcon() {
  return (
    <svg
      width="41"
      height="41"
      viewBox="0 0 41 41"
      fill="none"
      aria-hidden
      className="size-[41px]"
    >
      <circle
        cx="20.5"
        cy="20.5"
        r="20.5"
        fill="var(--brand-forest)"
        fillOpacity="0.4"
      />
      <path
        d="M13.5383 27.0475C13.1478 27.438 13.1478 28.0712 13.5383 28.4617C13.9288 28.8523 14.562 28.8523 14.9525 28.4617L14.2454 27.7546L13.5383 27.0475ZM28.7547 14.2454C28.7547 13.6931 28.307 13.2454 27.7547 13.2454L18.7547 13.2454C18.2024 13.2454 17.7547 13.6931 17.7547 14.2454C17.7547 14.7977 18.2024 15.2454 18.7547 15.2454L26.7547 15.2454L26.7547 23.2454C26.7547 23.7977 27.2024 24.2454 27.7547 24.2454C28.307 24.2454 28.7547 23.7977 28.7547 23.2454L28.7547 14.2454ZM14.2454 27.7546L14.9525 28.4617L28.4618 14.9525L27.7547 14.2454L27.0476 13.5383L13.5383 27.0475L14.2454 27.7546Z"
        fill="var(--brand-forest)"
      />
    </svg>
  );
}

function NextArrowIcon() {
  return (
    <svg
      width="41"
      height="41"
      viewBox="0 0 41 41"
      fill="none"
      aria-hidden
      className="size-[41px]"
    >
      <circle
        cx="20.5"
        cy="20.5"
        r="20"
        fill="var(--brand-forest)"
        stroke="white"
      />
      <path
        d="M28.7547 14.2454C28.7547 13.6931 28.307 13.2454 27.7547 13.2454L18.7547 13.2454C18.2024 13.2454 17.7547 13.6931 17.7547 14.2454C17.7547 14.7977 18.2024 15.2454 18.7547 15.2454L26.7547 15.2454L26.7547 23.2454C26.7547 23.7977 27.2024 24.2454 27.7547 24.2454C28.307 24.2454 28.7547 23.7977 28.7547 23.2454L28.7547 14.2454ZM14.2454 27.7546L14.9525 28.4617L28.4618 14.9525L27.7547 14.2454L27.0476 13.5383L13.5383 27.0475L14.2454 27.7546Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Category carousel switchers — Figma Frame 2113 / 196:214.
 * Overlapping 58px hit targets; 41px glyphs rotated to left/right arrows.
 */
export function HomeCategorySwitchers({
  previousLabel,
  nextLabel,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: HomeCategorySwitchersProps) {
  return (
    <div
      className="flex items-center justify-center"
      data-node-id="196:214"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label={previousLabel}
        className="relative mr-[-10px] flex size-[58px] shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
        data-node-id="196:215"
      >
        <span className="-scale-y-100 rotate-135">
          <PrevArrowIcon />
        </span>
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label={nextLabel}
        className="relative flex size-[58px] shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
        data-node-id="196:218"
      >
        <span className="rotate-45">
          <NextArrowIcon />
        </span>
      </button>
    </div>
  );
}
