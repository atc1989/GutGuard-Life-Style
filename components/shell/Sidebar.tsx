"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { BASE_STEPS } from "@/lib/mock/seed";
import { cx } from "@/lib/cx";

const NAV = [
  { href: "/app/health", id: "health", label: "My Health" },
  { href: "/app/team", id: "team", label: "My Team" },
  { href: "/app/story", id: "story", label: "My Story" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { open } = useOverlay();
  const { session } = useSession();
  const baseCount = session.baseDone.filter(Boolean).length;
  const baseComplete = baseCount === BASE_STEPS.length;

  return (
    <aside className="gg-sidebar">
      <div className="gg-sidebar__brand">
        <strong>Gutguard</strong>
        <em>Lifestyle</em>
      </div>
      <nav className="gg-sidebar__nav" aria-label="Member">
        {NAV.map((item) => {
          const current = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx("gg-nav-btn", current && "is-active")}
              aria-current={current ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="gg-sidebar__rule" />
      <div className="gg-sidebar__tools">
        <button
          type="button"
          className="gg-nav-btn gg-nav-btn--quiet"
          onClick={() => open("base")}
        >
          {baseComplete
            ? "BASE Activation ✓"
            : `BASE Activation · ${baseCount}/${BASE_STEPS.length}`}
        </button>
        <button
          type="button"
          className="gg-nav-btn gg-nav-btn--quiet"
          onClick={() => open(baseComplete ? "gema" : "base")}
          aria-disabled={!baseComplete || undefined}
        >
          {baseComplete ? "GEMA" : "GEMA locked"}
        </button>
        <button
          type="button"
          className="gg-nav-btn gg-nav-btn--quiet"
          onClick={() => open("ggverse")}
        >
          GG-VERSE
        </button>
        <button
          type="button"
          className="gg-nav-btn gg-nav-btn--quiet"
          onClick={() => open("settings")}
        >
          Settings
        </button>
      </div>
      <div className="gg-sidebar__foot">
        <Button variant="commerce" block onClick={() => open("order")}>
          Order now
        </Button>
        <p className="gg-help gg-sidebar__supply">
          {session.daysLeft} days of supply left
        </p>
        <Badge>{session.team}</Badge>
      </div>
    </aside>
  );
}
