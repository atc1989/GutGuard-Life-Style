import { cx } from "@/lib/cx";

/**
 * UI Library `ProgressBar`. `journey` is the heat → gold → recovery fill with
 * paper ticks between `segments`; `heat` / `recovery` fill a bone-deep track.
 * The caller owns any heading or badge above it.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  showLabel,
  tone = "journey",
  segments = 1,
  thin,
  className,
}: {
  value: number;
  max?: number;
  label: string;
  showLabel?: boolean;
  tone?: "journey" | "heat" | "recovery";
  segments?: number;
  thin?: boolean;
  className?: string;
}) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const ticks = tone === "journey" && segments > 1 ? segments - 1 : 0;

  return (
    <div className={cx("gg-bar", showLabel && "gg-bar--labelled", className)}>
      {showLabel ? (
        <span className="gg-bar__label" aria-hidden>
          {label}
        </span>
      ) : null}
      <div
        className={cx("gg-bar__track", `gg-bar__track--${tone}`, thin && "gg-bar__track--thin")}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(Math.max(0, Math.min(max, value)))}
      >
        <i className="gg-bar__fill" style={{ width: `${pct}%` }} />
        {Array.from({ length: ticks }, (_, index) => (
          <b
            key={index}
            className="gg-bar__tick"
            style={{ left: `${((index + 1) / segments) * 100}%` }}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}
