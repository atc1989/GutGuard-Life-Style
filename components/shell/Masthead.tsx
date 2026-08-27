"use client";

import { usePathname, useRouter } from "next/navigation";
import { AccountMenu } from "@/components/shell/AccountChrome";
import { NotificationBell } from "@/components/shell/NotificationBell";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

const TABS = [
  { id: "/app/health", label: "Health" },
  { id: "/app/team", label: "Team" },
  { id: "/app/story", label: "Story" },
] as const;

export function Masthead() {
  const pathname = usePathname();
  const router = useRouter();
  const current = TABS.some((tab) => tab.id === pathname)
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
        <SegmentedControl
          label="Member sections"
          value={current}
          options={TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
          onChange={(href) => router.push(href)}
        />
      </div>
    </header>
  );
}
