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
      <nav aria-label="Member" style={{ display: "grid", gap: 4, padding: "0 8px" }}>
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cx("gg-nav-btn", pathname === item.href && "is-active")}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div style={{ height: 1, background: "var(--gg-rule)", margin: "14px 12px" }} />
      <div style={{ display: "grid", gap: 4, padding: "0 8px" }}>
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
        >
          {baseComplete ? "GEMA" : "GEMA 🔒"}
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
      <div style={{ marginTop: "auto", padding: "18px 12px 0" }}>
        <Button variant="commerce" block onClick={() => open("order")}>
          Order now
        </Button>
        <p className="gg-help" style={{ marginTop: 8 }}>
          {session.daysLeft} days of supply left
        </p>
        <Badge>{session.team}</Badge>
      </div>
    </aside>
  );
}
