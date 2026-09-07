type ProfileStatCardProps = {
  label: string;
  value: string;
  /**
   * `glass` — storefront liquid-glass (white text).
   * `mint` — mobile dashboard tile (pale green + forest text).
   */
  variant?: "glass" | "mint";
};

/**
 * Desktop: liquid-glass on forest. Mobile sheet: solid mint via CSS.
 * Admin surfaces can pass `variant="mint"` for the same mobile look.
 */
export function ProfileStatCard({
  label,
  value,
  variant = "glass",
}: ProfileStatCardProps) {
  if (variant === "mint") {
    return (
      <div className="isolate overflow-hidden rounded-3xl bg-[#cfe8c4] p-5 transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:-translate-y-2 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6">
        <p className="font-big-fat-boii text-[11px] font-normal tracking-wide text-brand-forest/70 uppercase sm:text-xs">
          {label}
        </p>
        <p className="mt-2 font-big-fat-boii text-2xl font-normal tracking-wide text-brand-forest sm:mt-3 sm:text-3xl">
          {value}
        </p>
      </div>
    );
  }

  return (
    <div className="profile-stat-card liquid-glass isolate overflow-hidden rounded-3xl p-5 transition-[translate,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:z-10 hover:-translate-y-2 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6">
      <p className="profile-stat-card-label relative z-[2] font-big-fat-boii text-[11px] font-normal tracking-wide text-white uppercase sm:text-xs">
        {label}
      </p>
      <p className="profile-stat-card-value relative z-[2] mt-2 font-big-fat-boii text-2xl font-normal tracking-wide text-white sm:mt-3 sm:text-3xl">
        {value}
      </p>
    </div>
  );
}
