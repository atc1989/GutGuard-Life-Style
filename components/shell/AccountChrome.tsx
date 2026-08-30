"use client";

import { Bell, Settings } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cx } from "@/lib/cx";
import { Avatar } from "@/components/ui/Avatar";
import { IconButton } from "@/components/ui/IconButton";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { memberDisplayName } from "@/lib/initials";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { memberNotifications } from "@/lib/member-notifications";

function AccountMeta({ name, sponsor }: { name: string; sponsor: string }) {
  return (
    <span className="gg-account__meta">
      <strong>{name}</strong>
      <span className="gg-help">with {sponsor}</span>
    </span>
  );
}

/** Desktop sidebar: identity, settings, and sign out always visible. */
export function AccountCard() {
  const { session } = useSession();
  const { open } = useOverlay();
  const name = memberDisplayName(session.name);

  return (
    <div className="gg-account-card">
      <div className="gg-account-card__row">
        <Avatar name={name} />
        <AccountMeta name={name} sponsor={session.sponsor} />
        <IconButton label="Settings" ghost onClick={() => open("settings")}>
          <Settings />
        </IconButton>
      </div>
      <SignOutButton />
    </div>
  );
}

/** Mobile masthead: avatar opens Settings + Sign out. */
export function AccountMenu() {
  const { session } = useSession();
  const { open } = useOverlay();
  const name = memberDisplayName(session.name);
  const notifications = memberNotifications(session);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;

    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    const menuItems = () =>
      Array.from(
        rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [],
      );
    requestAnimationFrame(() => menuItems()[0]?.focus());

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const items = menuItems();
      const current = items.indexOf(document.activeElement as HTMLButtonElement);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      items[(current + direction + items.length) % items.length]?.focus();
    }

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <div className={cx("gg-account", menuOpen && "is-open")} ref={rootRef}>
      <button
        ref={triggerRef}
        id="gg-account-trigger"
        type="button"
        className="gg-account__trigger"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={`${name}, account menu`}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <Avatar name={name} />
      </button>
      {menuOpen ? (
        <div className="gg-account__menu" id={menuId} role="menu">
          <div className="gg-account__menu-head" role="none">
            <Avatar name={name} />
            <AccountMeta name={name} sponsor={session.sponsor} />
          </div>
          <button
            type="button"
            className="gg-nav-btn"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              open("notifications");
            }}
          >
            <Bell aria-hidden />
            <span>Notifications</span>
            {notifications.length ? (
              <span className="gg-account__badge">{notifications.length}</span>
            ) : null}
          </button>
          <button
            type="button"
            className="gg-nav-btn"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              open("settings");
            }}
          >
            <Settings aria-hidden />
            Settings
          </button>
          <SignOutButton role="menuitem" block />
        </div>
      ) : null}
    </div>
  );
}
