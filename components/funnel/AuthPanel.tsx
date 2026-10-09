import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

/**
 * UI Library section `AuthPanel`: the two-column Lifestyle landing / sign-up
 * layout. Left: a short intro line and the card (or several blocks). Right: a
 * labelled column with the form or offer. From 900px one column is sticky:
 * `card` keeps the card still while the form scrolls, `content` keeps the
 * offer and CTA still while the left side scrolls.
 */
export function AuthPanel({
  intro,
  card,
  title,
  titleId,
  sticky = "card",
  className,
  children,
}: {
  intro?: ReactNode;
  card: ReactNode;
  title?: string;
  titleId?: string;
  sticky?: "card" | "content";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx("gg-auth", `gg-auth--sticky-${sticky}`, className)}>
      <div className="gg-auth__card">
        {intro ? <p className="gg-auth__intro">{intro}</p> : null}
        {card}
      </div>
      <div className="gg-auth__content">
        {title ? (
          <h2 className="gg-auth__label" id={titleId}>
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/** Page container for the funnel: 460 → 560 → 1040 → 1160px. */
export function FunnelPage({
  narrow,
  children,
}: {
  narrow?: boolean;
  children: ReactNode;
}) {
  return <main className={cx("gg-funnel", narrow && "gg-funnel--narrow")}>{children}</main>;
}
