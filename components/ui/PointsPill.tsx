import Link from "next/link";
import { cx } from "@/lib/cx";

/**
 * UI Library `PointsPill`: the member's E-Points in the top bar, or a plain
 * text pill ("Log in") when `points` is omitted. Always a real link or button.
 */
export function PointsPill({
  label,
  points,
  href,
  onClick,
  className,
}: {
  label: string;
  points?: number;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const withPoints = typeof points === "number";
  const classes = cx("gg-points-pill", withPoints && "gg-points-pill--points", className);
  const body = withPoints ? (
    <>
      <b>{points.toLocaleString()}</b>
      <span>{label}</span>
    </>
  ) : (
    label
  );
  const name = withPoints ? `${points} ${label}` : undefined;

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={name}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} aria-label={name} onClick={onClick}>
      {body}
    </button>
  );
}
