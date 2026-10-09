"use client";

import { CalendarDays, GraduationCap } from "lucide-react";
import { spokeLinks, type SpokeKey } from "@/lib/app-links";

const ICONS: Record<SpokeKey, typeof CalendarDays> = {
  gema: CalendarDays,
  academy: GraduationCap,
};

/**
 * Change 5 — the hub's links to Events and Academy.
 *
 * Plain anchors, not `next/link`: these are other origins, and a router prefetch
 * would be a cross-origin request for nothing. Same tab on purpose — the three
 * apps are meant to read as one system, and Change 6 makes the session follow.
 *
 * Renders nothing at all when no spoke origin is configured, which is the state
 * before the owner's DNS lands. An empty group heading is worse than no group.
 */
export function SpokeLinks({ variant }: { variant: "sidebar" | "sheet" }) {
  const links = spokeLinks();
  if (links.length === 0) return null;

  if (variant === "sheet") {
    return (
      <>
        {links.map((link) => {
          const Icon = ICONS[link.key];
          return (
            <a key={link.key} href={link.href} className="gg-button gg-button--secondary">
              <Icon aria-hidden />
              {link.label}
            </a>
          );
        })}
      </>
    );
  }

  return (
    <>
      <hr className="gg-sidebar__rule" />
      <p className="gg-sidebar__label gg-eyebrow">Elsewhere</p>
      <div className="gg-sidebar__tools">
        {links.map((link) => {
          const Icon = ICONS[link.key];
          return (
            <a
              key={link.key}
              href={link.href}
              className="gg-nav-btn gg-nav-btn--quiet"
              title={link.hint}
            >
              <Icon aria-hidden />
              {link.label}
            </a>
          );
        })}
      </div>
    </>
  );
}
