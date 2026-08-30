"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  BookOpen,
  ClipboardCheck,
  Heart,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";
import { AccountCard } from "@/components/shell/AccountChrome";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { BASE_STEPS, hasSupply } from "@/lib/mock/seed";
import { cx } from "@/lib/cx";
import type { LucideIcon } from "lucide-react";
import { useLinkStatus } from "next/link";
import { Spinner } from "@/components/ui/Spinner";

const NAV: Array<{
  href: "/app/health" | "/app/team" | "/app/story";
  label: string;
  icon: LucideIcon;
}> = [
  { href: "/app/health", label: "My Health", icon: Heart },
  { href: "/app/team", label: "My Team", icon: Users },
  { href: "/app/story", label: "My Story", icon: BookOpen },
];

function NavLabel({ children }: { children: string }) {
  const { pending } = useLinkStatus();
  return (
    <span className="gg-nav-label">
      {children}
      {pending ? <Spinner label={`Loading ${children}`} /> : null}
    </span>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { open } = useOverlay();
  const { session } = useSession();
  const baseCount = session.baseDone.filter(Boolean).length;
  const baseComplete = baseCount === BASE_STEPS.length;

  return (
    <aside className="gg-sidebar" aria-label="Member navigation">
      <Link href="/app/health" className="gg-sidebar__brand">
        <strong>Gutguard</strong>
        <em>Lifestyle</em>
      </Link>
      <nav className="gg-sidebar__nav" aria-label="Member">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx("gg-nav-btn", active && "is-active")}
              aria-current={active ? "page" : undefined}
            >
              <Icon aria-hidden />
              <NavLabel>{item.label}</NavLabel>
            </Link>
          );
        })}
      </nav>
      <hr className="gg-sidebar__rule" />
      <p className="gg-sidebar__label gg-eyebrow">Protocol</p>
      <div className="gg-sidebar__tools">
        <button
          type="button"
          className="gg-nav-btn gg-nav-btn--quiet"
          onClick={() => open("base")}
        >
          <ClipboardCheck aria-hidden />
          {baseComplete
            ? "BASE Activation"
            : `BASE Activation · ${baseCount}/${BASE_STEPS.length}`}
        </button>
        <button
          type="button"
          className="gg-nav-btn gg-nav-btn--quiet"
          onClick={() => open("gema")}
        >
          {baseComplete ? <Award aria-hidden /> : <Lock aria-hidden />}
          {baseComplete ? "GEMA" : "GEMA · locked"}
        </button>
        <button
          type="button"
          className="gg-nav-btn gg-nav-btn--quiet"
          onClick={() => open("ggverse")}
        >
          <Sparkles aria-hidden />
          GG-VERSE
        </button>
      </div>
      <div className="gg-sidebar__foot">
        <div className="gg-sidebar__order">
          <Button variant="commerce" block onClick={() => open("order")}>
            Order now
          </Button>
          <div className="gg-sidebar__supply">
            <p className="gg-help">
              {hasSupply(session.daysLeft)
                ? `${session.daysLeft} days of supply left`
                : "No bottle yet"}
            </p>
            <Badge>{session.team}</Badge>
          </div>
        </div>
        <AccountCard />
      </div>
    </aside>
  );
}
