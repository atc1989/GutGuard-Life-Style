"use client";

import { Bell } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconButton } from "@/components/ui/IconButton";
import { cx } from "@/lib/cx";
import { hasSupply } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";

export function NotificationBell() {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const items = [
    session.invites[0] ? `${session.invites[0].name} registered` : null,
    hasSupply(session.daysLeft) && session.daysLeft <= 10
      ? `${session.daysLeft} days of Gutguard left`
      : null,
  ].filter((item): item is string => Boolean(item));

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => panelRef.current?.focus());
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={cx("gg-bell", open && "is-open")} ref={rootRef}>
      <IconButton
        ref={triggerRef}
        label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell />
      </IconButton>
        {items.length ? (
          <span className="gg-bell__count">{items.length}</span>
        ) : null}
      {open ? (
        <div
          className="gg-bell__panel"
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          tabIndex={-1}
        >
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
