"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { hasSupply } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";

export function NotificationBell() {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const items = [
    session.invites[0] ? `${session.invites[0].name} registered` : null,
    hasSupply(session.daysLeft) && session.daysLeft <= 10
      ? `${session.daysLeft} days of Gutguard left`
      : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="gg-bell">
      <IconButton label="Notifications" onClick={() => setOpen((v) => !v)}>
        <Bell />
      </IconButton>
        {items.length ? (
          <span className="gg-bell__count">{items.length}</span>
        ) : null}
      {open ? (
        <div className="gg-bell__panel">
          <Card>
            {items.length === 0 ? (
              <EmptyState title="No alerts" copy="You’re all caught up." />
            ) : (
              <ul className="gg-stack" style={{ listStyle: "none" }}>
                {items.map((item) => (
                  <li key={item} className="gg-help" style={{ color: "var(--gg-ink)" }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
