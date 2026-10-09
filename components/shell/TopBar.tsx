import Link from "next/link";
import type { ReactNode } from "react";

/**
 * UI Library `TopBar`, `app` variant: logo, "/ <here>", right slot. Sticky,
 * with the heat → gold → recovery seam on top. The Library's site links are
 * not rendered — Lifestyle has no pages for them.
 */
export function TopBar({
  here,
  homeHref = "/",
  right,
}: {
  here: string;
  homeHref?: string;
  right?: ReactNode;
}) {
  return (
    <header className="gg-topbar">
      <div className="gg-topbar__in">
        <div className="gg-topbar__lead">
          <Link href={homeHref} className="gg-topbar__brand" aria-label={`Gutguard ${here} home`}>
            Gutguard
          </Link>
          <span className="gg-topbar__here" aria-hidden>
            / {here}
          </span>
        </div>
        {right ? <div className="gg-topbar__right">{right}</div> : null}
      </div>
    </header>
  );
}
