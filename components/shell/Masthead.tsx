"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu } from "@/components/shell/AccountChrome";
import { NotificationBell } from "@/components/shell/NotificationBell";
import { cx } from "@/lib/cx";
import { Spinner } from "@/components/ui/Spinner";

const TABS = [
  { href: "/app/health", label: "Health" },
  { href: "/app/team", label: "Team" },
  { href: "/app/story", label: "Story" },
] as const;

function NavLabel({ children }: { children: string }) {
  const { pending } = useLinkStatus();
  return (
    <span className="gg-nav-label">
      {children}
      {pending ? <Spinner label={`Loading ${children}`} /> : null}
    </span>
  );
}

export function Masthead() {
  const pathname = usePathname();
  const current = TABS.some((tab) => tab.href === pathname)
    ? pathname
    : "/app/health";

  return (
    <header className="gg-masthead">
      <div className="gg-masthead__bar">
        <div className="gg-mobile-only">
          <AccountMenu />
        </div>
        <NotificationBell />
      </div>
      <div className="gg-mobile-only gg-masthead-tabs">
        {/* Links, not buttons: these are navigation, so they prefetch, honour
            long-press / middle-click, and expose aria-current like the sidebar. */}
        <nav className="gg-segment" aria-label="Member sections">
          {TABS.map((tab) => {
            const active = tab.href === current;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cx("gg-segment__button", active && "is-active")}
              >
                <NavLabel>{tab.label}</NavLabel>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
