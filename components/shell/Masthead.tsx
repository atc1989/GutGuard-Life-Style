"use client";

import { usePathname, useRouter } from "next/navigation";
import { NotificationBell } from "@/components/shell/NotificationBell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useSession } from "@/lib/session";

const TABS = [
  { id: "/app/health", label: "Health" },
  { id: "/app/team", label: "Team" },
  { id: "/app/story", label: "Story" },
] as const;

export function Masthead() {
  const { session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const current = TABS.some((tab) => tab.id === pathname)
    ? pathname
    : "/app/health";

  return (
    <div>
      <header className="gg-masthead">
        <div className="gg-masthead__meta">
          <p className="gg-eyebrow">{session.sponsor}</p>
          <strong>Gutguard Lifestyle</strong>
        </div>
        <NotificationBell />
      </header>
      <div className="gg-mobile-only gg-masthead__tabs">
        <SegmentedControl
          label="Member sections"
          value={current}
          options={TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
          onChange={(href) => router.push(href)}
        />
      </div>
    </div>
  );
}
