import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

/**
 * UI Library `IconRow`: icon + title + a line of grey text. Not interactive.
 * `benefit` stacks with a divider below, `heading` heads a panel.
 */
export function IconRow({
  variant = "benefit",
  icon,
  title,
  children,
  className,
}: {
  variant?: "benefit" | "heading" | "list";
  icon: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("gg-icon-row", `gg-icon-row--${variant}`, className)}>
      <span className="gg-icon-row__icon" aria-hidden>
        {icon}
      </span>
      <div>
        <p className="gg-icon-row__title">{title}</p>
        {children ? <p className="gg-icon-row__text">{children}</p> : null}
      </div>
    </div>
  );
}
