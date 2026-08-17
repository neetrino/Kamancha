type HomeDiamondMarkProps = {
  /** White on forest sections; forest on light category labels. */
  tone?: "light" | "forest";
  className?: string;
};

/**
 * Three-diamond ornament from Figma mobile home (196:307 / 196:195).
 */
export function HomeDiamondMark({
  tone = "light",
  className = "",
}: HomeDiamondMarkProps) {
  const fill = tone === "light" ? "#ffffff" : "#265127";

  return (
    <svg
      width="27"
      height="10"
      viewBox="0 0 27 10"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path fill={fill} d="M5.4 1.2 8.6 5 5.4 8.8 2.2 5z" />
      <path fill={fill} d="M13.5 0.4 17.2 5 13.5 9.6 9.8 5z" />
      <path fill={fill} d="M21.6 1.2 24.8 5 21.6 8.8 18.4 5z" />
    </svg>
  );
}
