import { cx } from "@/lib/cx";
import { memberInitials } from "@/lib/initials";

/**
 * UI Library `Avatar`: initials in a circle. Decorative — the name beside it
 * carries the meaning. `bone` for members, `ink` for sponsors, `gold` for quotes.
 */
export function Avatar({
  name,
  tone = "bone",
  size = 38,
  className,
}: {
  name: string;
  tone?: "bone" | "ink" | "gold";
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cx("gg-avatar", `gg-avatar--${tone}`, className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      aria-hidden="true"
    >
      {memberInitials(name)}
    </span>
  );
}
