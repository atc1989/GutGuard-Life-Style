import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

/**
 * UI Library `StatGroup`: a row of figures, each read before its label.
 * `boxed` is the Lifestyle equal-column strip (a `highlight` item turns heat),
 * `trust` the blue-figure band.
 */
export type StatItem = { value: ReactNode; label: string; highlight?: boolean };

export function StatGroup({
  variant = "boxed",
  items,
  className,
}: {
  variant?: "boxed" | "trust";
  items: StatItem[];
  className?: string;
}) {
  return (
    <div
      className={cx("gg-stats", `gg-stats--${variant}`, className)}
      style={{ ["--gg-stat-count" as string]: items.length }}
    >
      {items.map((item) => (
        <p
          key={item.label}
          className={cx("gg-stats__item", item.highlight && "is-highlight")}
        >
          <strong className="gg-stats__value">{item.value}</strong>
          <span className="gg-stats__label">{item.label}</span>
        </p>
      ))}
    </div>
  );
}
