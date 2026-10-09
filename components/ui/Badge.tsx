import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

/**
 * UI Library `Badge`. `active` keeps the DS blue outline used across the app;
 * `tone` picks the Library variant; `dot` switches to the sans status line
 * (ok = recovery, warn = gold, stop = heat). The word always carries the meaning.
 */
export function Badge({
  active,
  tone = "outline",
  dot,
  className,
  children,
}: {
  active?: boolean;
  tone?: "outline" | "status" | "solid" | "text";
  dot?: "ok" | "warn" | "stop";
  className?: string;
  children: ReactNode;
}) {
  if (dot) {
    return (
      <span className={cx("gg-status", `gg-status--${dot}`, className)}>
        <i aria-hidden />
        {children}
      </span>
    );
  }
  return (
    <span
      className={cx(
        "gg-badge",
        tone !== "outline" && `gg-badge--${tone}`,
        active && "gg-badge--active",
        className,
      )}
    >
      {children}
    </span>
  );
}
