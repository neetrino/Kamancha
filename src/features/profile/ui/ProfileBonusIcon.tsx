import { Sparkles } from "lucide-react";

/** Bonus balance icon — outline, matches profile nav bonuses item. */
export function ProfileBonusIcon({
  className = "h-5 w-5",
}: {
  className?: string;
}) {
  return <Sparkles className={className} strokeWidth={1.75} aria-hidden />;
}
